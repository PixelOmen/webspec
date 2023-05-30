var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as search from './libs/search.js';
import * as fetchDB from "./libs/fetchDB.js";
import * as detailedView from './libs/detailedview.js';
import * as notifications from './libs/notifications.js';
const ELEMENTS = {
    tableItemsContainer: document.getElementById('table-items-container'),
    tableHeaders: document.getElementById('table-headers'),
    clientSelect: document.getElementById('client-select-dropdown'),
    searchContainer: document.getElementById("search-container-main"),
    searchInput: document.getElementById("search-container-main-input"),
    searchResultContainer: document.getElementById("search-results-container-main"),
    searchResultList: document.getElementById("search-results-list")
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
    setTimeout(() => {
        let msg = "Connection lost. Please try refreshing the page.";
        new notifications.NotificationMsg(() => {
            window.location.reload();
        }).displayNotification(msg);
    }, 500);
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
function setClientDropdown() {
    ELEMENTS.clientSelect.innerHTML = "";
    ELEMENTS.clientSelect.addEventListener('change', () => __awaiter(this, void 0, void 0, function* () {
        const clientSpecs = yield fetchDB.fetchClientSpecs(ELEMENTS.clientSelect.value);
        setTableItems(clientSpecs.output.specs);
        if (!STATE.clientsLoaded) {
            STATE.clientsLoaded = true;
            window.dispatchEvent(new Event('clientsLoaded'));
        }
    }));
    fetchDB.fetchClients().then((res) => {
        if (res.status == "error") {
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
function createTableColumn(client, row, column, value, container) {
    const columnDiv = document.createElement('div');
    columnDiv.id = `table-item-${client}-${row}-${column}`;
    columnDiv.classList.add('table-column');
    columnDiv.innerHTML = value ? value : "N/A";
    container.appendChild(columnDiv);
}
function setTableItems(specs) {
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
function setColumnWidths() {
    const maxColumnWidths = {};
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
            const columnDiv = column;
            const currentWidth = Math.round(columnDiv.offsetWidth);
            if (currentWidth > maxColumnWidths[index]) {
                maxColumnWidths[index] = currentWidth;
            }
        });
    });
    rows.forEach((row) => {
        const columns = row.querySelectorAll('.table-column');
        const columnDiv = columns[1];
        columnDiv.style.minWidth = `${maxColumnWidths[1]}px`;
    });
}
function setSearchResults(resultsContainer, allResults, query) {
    resultsContainer.innerHTML = "";
    let found = 0;
    for (const specName of allResults) {
        if (!specName.toLowerCase().includes(query)) {
            continue;
        }
        const result = document.createElement('li');
        result.tabIndex = 0;
        result.classList.add('search-result');
        result.innerHTML = specName;
        resultsContainer.appendChild(result);
        result.addEventListener('click', () => {
            window.location.href = `/nav/view?spec=${specName}`;
        });
        found++;
    }
    if (!found) {
        const result = document.createElement('li');
        result.classList.add('search-result-empty');
        result.innerHTML = "No results found";
        resultsContainer.appendChild(result);
    }
}
function createSearchbar() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetchDB.fetchSpecNames();
        if (response.status != 'ok') {
            console.error(response.error);
            return;
        }
        const searchbar = new search.SearchBar(ELEMENTS.searchContainer, response.output.specNames, setSearchResults);
        searchbar.container.classList.remove('hidden');
    });
}
function loadSpecURL() {
    return __awaiter(this, void 0, void 0, function* () {
        const currentUrl = new URLSearchParams(window.location.search);
        const specName = currentUrl.get('spec');
        if (!specName)
            return;
        const response = yield fetchDB.fetchSpec(specName);
        if (response.status == "error") {
            new notifications.NotificationMsg().displayNotification(response.error);
            return;
        }
        const client = response.output.specs[0].client_name;
        ELEMENTS.clientSelect.value = client;
        ELEMENTS.clientSelect.dispatchEvent(new Event('change'));
        detailedView.display(response.output.specs[0]);
        return;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        setClientDropdown();
        createSearchbar();
        window.addEventListener('resize', setColumnWidths);
        window.addEventListener('clientsLoaded', loadSpecURL);
    });
}
main();
