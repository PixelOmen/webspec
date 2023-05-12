var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const ELEMENTS = {
    notificationBlur: document.getElementById('notification-blur'),
    notificationContainer: document.getElementById('notification-container-generic'),
    notificationMessage: document.getElementById('notification-message'),
    notificationBtnClose: document.getElementById('notification-btn-close'),
    notificationDisconnect: document.getElementById('notification-container-disconnect'),
    notificationBtnReload: document.getElementById('notification-btn-reload'),
    tableItemsContainer: document.getElementById('table-items-container'),
    clientSelect: document.getElementById('client-select-dropdown')
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
function fetchClients() {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch('/query/clients/all')
            .then((res) => res.json())
            .then((data) => { return data; });
    });
}
function fetchSpecs(client) {
    var baseURL = '/query/specs/';
    var fullURL = baseURL + encodeURIComponent(`client=${client}`);
    return fetch(fullURL)
        .then((res) => res.json())
        .then((data) => { return data; });
}
function setClientDropdown() {
    ELEMENTS.clientSelect.innerHTML = "";
    ELEMENTS.clientSelect.addEventListener('change', () => __awaiter(this, void 0, void 0, function* () {
        const clientSpecs = yield fetchSpecs(ELEMENTS.clientSelect.value);
        setTableItems(clientSpecs.output.specs);
    }));
    fetchClients().then((clients) => {
        for (const client of clients.output.clients) {
            const option = document.createElement('option');
            option.value = client;
            option.innerHTML = client;
            ELEMENTS.clientSelect.appendChild(option);
        }
        const changeEvent = new Event('change');
        ELEMENTS.clientSelect.dispatchEvent(changeEvent);
    });
}
function setTableItems(specs) {
    ELEMENTS.tableItemsContainer.innerHTML = "";
    for (const spec of specs) {
        console.log(spec);
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
export {};
