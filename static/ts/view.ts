import * as fetchDB from "./libs/fetchDB.js";
import * as detailedView from './libs/detailedview.js';
import * as notifications from './libs/notifications.js';
export {};

const ELEMENTS = {
    tableItemsContainer: document.getElementById('table-items-container') as HTMLDivElement,
    tableHeaders: document.getElementById('table-headers') as HTMLDivElement,
    clientSelect: document.getElementById('client-select-dropdown') as HTMLSelectElement,
    searchContainer: document.getElementById("search-container-main") as HTMLDivElement,
    searchInput: document.getElementById("search-container-main-input") as HTMLInputElement,
    searchResultContainer: document.getElementById("search-results-container-main") as HTMLDivElement,
    searchResultList: document.getElementById("search-results-list") as HTMLUListElement
};

const STATE = {
    CONNECTION: new WebSocket(`ws://${window.location.host}/connect`),
    sessionID: "",
    sendAllowed: true,
    clientsLoaded: false,
    username: "",
    password: ""
};
STATE.CONNECTION.onopen = () => {
    console.log("Connection open");
};
STATE.CONNECTION.onclose = () => {
    console.log("Connection closed");
    let msg = "Connection lost. Please try refreshing the page.";
    new notifications.NotificationMsg(() => {
        window.location.reload();
    }).displayNotification(msg);
};
STATE.CONNECTION.onerror = (e) => {
    console.error(e);
    new notifications.NotificationMsg().displayNotification(e.toString());
};
STATE.CONNECTION.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    switch (data.type) {
        case "sessionID":
            STATE.sessionID = data.sessionID;
            break;
        case "debug":
            console.log(data.msg);
            break;
        default:
            console.error(`Unknown websocket message type: ${data.type}`);
    }
};

function setClientDropdown(): void {
    ELEMENTS.clientSelect.innerHTML = "";
    ELEMENTS.clientSelect.addEventListener('change', async () => {
        const clientSpecs = await fetchDB.fetchClientSpecs(ELEMENTS.clientSelect.value);
        setTableItems(clientSpecs.output.specs);
        if (!STATE.clientsLoaded) {
            STATE.clientsLoaded = true;
            window.dispatchEvent( new Event('clientsLoaded'));
        }
    });
    fetchDB.fetchClients().then((res) => {
        if ( res.status == "error") {
            new notifications.NotificationMsg().displayNotification(res.error);
        }
        for (const client of res.output.clients) {
            const option = document.createElement('option');
            option.value = client;
            option.innerHTML = client;
            ELEMENTS.clientSelect.appendChild(option);
        }
        const changeEvent = new Event('change');
        ELEMENTS.clientSelect.dispatchEvent(changeEvent);
    });
}

function createTableColumn(client: string, row: number, column: number,
                            value: string | null, container: HTMLDivElement): void {
    const columnDiv = document.createElement('div');
    columnDiv.id = `table-item-${client}-${row}-${column}`;
    columnDiv.classList.add('table-column');
    columnDiv.innerHTML = value ? value : "N/A";
    container.appendChild(columnDiv);
}

function setTableItems(specs: fetchDB.Spec[]): void {
    ELEMENTS.tableItemsContainer.innerHTML = "";
    let row = 1;
    for (const spec of specs) {
        const item = document.createElement('div');
        item.classList.add('table-item');
        item.classList.add('table-column-container');
        createTableColumn(spec.client_name, row, 1, spec.id, item);
        createTableColumn(spec.client_name, row, 2, spec.name, item);
        createTableColumn(spec.client_name, row, 3, spec.created, item);
        createTableColumn(spec.client_name, row, 4, spec.updated, item);
        createTableColumn(spec.client_name, row, 5, spec.resolution, item);
        createTableColumn(spec.client_name, row, 6, spec.framerate, item);
        createTableColumn(spec.client_name, row, 7, spec.video_codec, item);
        createTableColumn(spec.client_name, row, 8, spec.audio_codec, item);
        createTableColumn(spec.client_name, row, 9, spec.start_timecode, item);
        ELEMENTS.tableItemsContainer.appendChild(item);
        item.addEventListener('click', () => {
            detailedView.display(spec);
        });
        row++;
    }
    setColumnWidths();
}

function setColumnWidths(): void {
    const maxColumnWidths: { [key: number]: number } = {};
    const totalColumns = ELEMENTS.tableHeaders.childElementCount;
    for (let i = 0; i < totalColumns; i++) {
        maxColumnWidths[i] = 0;
    }
    const rows = document.querySelectorAll('.table-column-container');
    rows.forEach((row) => {
        if (row == ELEMENTS.tableHeaders) {
            return;
        }
        const columns = row.querySelectorAll('.table-column');
        columns.forEach((column, index) => {
            const columnDiv = column as HTMLDivElement;
            const currentWidth = Math.round(columnDiv.offsetWidth);
            if (currentWidth > maxColumnWidths[index]) {
                maxColumnWidths[index] = currentWidth;
            }
        });
    });
    rows.forEach((row) => {
        const columns = row.querySelectorAll('.table-column');
        const columnDiv = columns[1] as HTMLDivElement;
        columnDiv.style.minWidth = `${maxColumnWidths[1]}px`;
    });
}

function setSearchResults(allSpecNames: string[], query: string): void {
    ELEMENTS.searchResultList.innerHTML = "";
    let found = 0;
    for (const specName of allSpecNames) {
        if (!specName.toLowerCase().includes(query)) {
            continue;
        }
        const result = document.createElement('li');
        result.classList.add('search-result');
        result.innerHTML = specName;
        ELEMENTS.searchResultList.appendChild(result);
        result.addEventListener('click', () => {
            window.location.href = `/nav/view?spec=${specName}`;
        });
        found++;
    }
    if (!found) {
        const result = document.createElement('li');
        result.classList.add('search-result');
        result.innerHTML = "No results found";
        ELEMENTS.searchResultList.appendChild(result);
    }
}

async function setSearchbar(): Promise<void> {
    ELEMENTS.searchContainer.classList.remove('hidden');
    const containerPosition = ELEMENTS.searchContainer.getBoundingClientRect();
    ELEMENTS.searchResultContainer.style.top = `${containerPosition.bottom}px`;
    ELEMENTS.searchResultContainer.style.left = `${containerPosition.left}px`;
    const response = await fetchDB.fetchSpecNames();
    if (response.status != 'ok') {
        console.error(response.error);
        return;
    }
    const specNames = response.output.specNames;
    ELEMENTS.searchInput.addEventListener('input', () => {
        const searchValue = ELEMENTS.searchInput.value.toLowerCase();
        if (searchValue) {
            ELEMENTS.searchResultContainer.classList.remove('hidden');
            console.log("keydown event added");
        } else {
            ELEMENTS.searchResultContainer.classList.add('hidden');
            console.log("keydown event removed");
        }
        setSearchResults(specNames, searchValue);
    });
    ELEMENTS.searchInput.addEventListener('focusout', () => {
        setTimeout(() => {
            ELEMENTS.searchResultContainer.classList.add('hidden');
            console.log("keydown event removed");
        }, 100);
    });
}

async function loadSpecURL(): Promise<void> {        
    const currentUrl = new URLSearchParams(window.location.search);
    const specName = currentUrl.get('spec');
    if (!specName) return;
    const response = await fetchDB.fetchSpec(specName);
    if (response.status == "error") {
        new notifications.NotificationMsg().displayNotification(response.error);
        return;
    }
    const client = response.output.specs[0].client_name;
    ELEMENTS.clientSelect.value = client;
    ELEMENTS.clientSelect.dispatchEvent(new Event('change'));
    detailedView.display(response.output.specs[0]);
    return;
}

async function main() {
    setClientDropdown();
    setSearchbar();
    window.addEventListener('resize', setColumnWidths);
    window.addEventListener('clientsLoaded', loadSpecURL);
    
}

main();