var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as detailedView from './libs/detailedview.js';
const ELEMENTS = {
    notificationBlur: document.getElementById('notification-blur'),
    notificationContainer: document.getElementById('notification-container-generic'),
    notificationMessage: document.getElementById('notification-message'),
    notificationBtnClose: document.getElementById('notification-btn-close'),
    notificationDisconnect: document.getElementById('notification-container-disconnect'),
    notificationBtnReload: document.getElementById('notification-btn-reload'),
    tableItemsContainer: document.getElementById('table-items-container'),
    tableHeaders: document.getElementById('table-headers'),
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
    fetchClients().then((res) => {
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
        createTableColumn(spec.client_name, row, 1, spec.name, item);
        createTableColumn(spec.client_name, row, 2, spec.created, item);
        createTableColumn(spec.client_name, row, 3, spec.updated, item);
        createTableColumn(spec.client_name, row, 4, spec.resolution, item);
        createTableColumn(spec.client_name, row, 5, spec.framerate, item);
        createTableColumn(spec.client_name, row, 6, spec.video_codec, item);
        createTableColumn(spec.client_name, row, 7, spec.audio_codec, item);
        createTableColumn(spec.client_name, row, 8, spec.start_timecode, item);
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
        const columnDiv = columns[0];
        columnDiv.style.minWidth = `${maxColumnWidths[0]}px`;
    });
}
function main() {
    ELEMENTS.notificationBtnReload.addEventListener('click', () => {
        window.location.reload();
    });
    setClientDropdown();
}
main();
