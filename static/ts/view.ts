export {};

const ELEMENTS = {
    notificationBlur: document.getElementById('notification-blur') as HTMLDivElement,
    notificationContainer: document.getElementById('notification-container-generic') as HTMLDivElement,
    notificationMessage: document.getElementById('notification-message') as HTMLDivElement,
    notificationBtnClose: document.getElementById('notification-btn-close') as HTMLButtonElement,
    notificationDisconnect: document.getElementById('notification-container-disconnect') as HTMLDivElement,
    notificationBtnReload: document.getElementById('notification-btn-reload') as HTMLButtonElement,
    tableItemsContainer: document.getElementById('table-items-container') as HTMLDivElement,
    clientSelect: document.getElementById('client-select-dropdown') as HTMLSelectElement
};

const STATE = {
    CONNECTION: new WebSocket(`ws://${window.location.host}/connect`),
    sessionID: "",
    sendAllowed: true,
    username: "",
    password: ""
};
STATE.CONNECTION.onopen = () => {
    console.log("Connection open");
};
STATE.CONNECTION.onclose = () => {
    ELEMENTS.notificationDisconnect.classList.remove('hidden');
    ELEMENTS.notificationBlur.classList.remove('hidden');
    console.log("Connection closed");
};
STATE.CONNECTION.onerror = (e) => {
    ELEMENTS.notificationDisconnect.classList.remove('hidden');
    ELEMENTS.notificationBlur.classList.remove('hidden');
    console.error(e);
};
STATE.CONNECTION.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.type === "sessionID") {
        STATE.sessionID = data.sessionID;
        return;
    }
    if (data.type === "debug") {
        console.log(data.msg);
    }
};

interface ClientResponse {
    type: string;
    error: string;
    output: {
        "clients": string[];
    }
}

interface SpecResponse {
    type: string;
    error: string;
    output: {
        "specs": Spec[];
    }
}

interface Spec {
    [key: string]: any;
    source: string; //Base64 encoded string
}

async function fetchClients(): Promise<ClientResponse> {
    return fetch('/query/clients/all')
        .then((res) => res.json())
        .then((data) => { return data; });
}

function fetchSpecs(client: string): Promise<SpecResponse> {
    var baseURL = '/query/specs/';
    var fullURL = baseURL + encodeURIComponent(`client=${client}`);
    return fetch(fullURL)
        .then((res) => res.json())
        .then((data) => { return data; });
}

function setClientDropdown(): void {
    ELEMENTS.clientSelect.innerHTML = "";
    ELEMENTS.clientSelect.addEventListener('change', async () => {
        const clientSpecs = await fetchSpecs(ELEMENTS.clientSelect.value);
        setTableItems(clientSpecs.output.specs);
    });
    fetchClients().then((clients) => {
        for (const client of clients.output.clients) {
            const option = document.createElement('option');
            option.value = client;
            option.innerHTML = client;
            ELEMENTS.clientSelect.appendChild(option);
        }
        const event = new Event('change');
        ELEMENTS.clientSelect.dispatchEvent(event);
    });
}

function setTableItems(specs: Spec[]): void {
    ELEMENTS.tableItemsContainer.innerHTML = "";
    for (const spec of specs) {
        const item = document.createElement('div');
        item.classList.add('table-item');
        item.innerHTML = spec.name;
        ELEMENTS.tableItemsContainer.appendChild(item);
    }
}

function main() {
    setClientDropdown();
}

main();