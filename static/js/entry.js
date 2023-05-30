var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchDB from "./libs/fetchDB.js";
import * as loading from './libs/loading.js';
import * as notifications from './libs/notifications.js';
const ELEMENTS = {
    form: document.getElementById('form-main'),
    clientSelect: document.getElementById('select-client'),
    clientName: document.getElementById('input-clientName'),
    clientNameContainer: document.getElementById('input-clientName-container'),
    docUploadBtnVisual: document.getElementById('input-docUpload-visual'),
    docUploadBtnActual: document.getElementById('input-docUpload-actual'),
    docUploadFilename: document.getElementById('input-docUpload-filename'),
    templateUploadBtnVisual: document.getElementById('input-templateUpload-visual'),
    templateUploadBtnActual: document.getElementById('input-templateUpload-actual'),
    templateUploadFilename: document.getElementById('input-templateUpload-filename'),
};
const STATE = {
    CONNECTION: new WebSocket(`ws://${window.location.host}/connect`),
    sessionID: "",
    sendAllowed: true,
    username: "",
    password: "",
    isEditSession: false
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
function formToFormData(form) {
    const formData = new FormData(form);
    const jsonobj = { "sessionID": STATE.sessionID };
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            continue;
        }
        jsonobj[key] = value.trim();
    }
    const elements = form.querySelectorAll('input[type="checkbox"]');
    const checkboxes = elements;
    for (const checkbox of checkboxes) {
        jsonobj[checkbox.name] = checkbox.checked;
    }
    formData.append("jsonData", JSON.stringify(jsonobj));
    return formData;
}
function sendForm(form) {
    return __awaiter(this, void 0, void 0, function* () {
        const formData = formToFormData(form);
        const uploadType = STATE.isEditSession ? "edit" : "new";
        return fetch(`/upload/${uploadType}`, {
            method: 'POST',
            body: formData,
        }).then((res) => {
            return res.json();
        }).then((data) => {
            return data;
        });
    });
}
function setClientDropdown() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetchDB.fetchClients();
        if (response.status !== "ok") {
            console.error(response.error);
            return;
        }
        if (ELEMENTS.clientSelect.value == "new") {
            var currentClient = ELEMENTS.clientName.value;
        }
        else {
            var currentClient = ELEMENTS.clientSelect.value;
        }
        ELEMENTS.clientSelect.innerHTML = "";
        const defaultOption = document.createElement('option');
        defaultOption.value = "new";
        defaultOption.innerText = "New";
        ELEMENTS.clientSelect.appendChild(defaultOption);
        ELEMENTS.clientNameContainer.classList.remove('hidden');
        ELEMENTS.clientName.value = "";
        const clients = response.output.clients;
        clients.forEach((client) => {
            const option = document.createElement('option');
            option.value = client;
            option.innerText = client;
            ELEMENTS.clientSelect.appendChild(option);
        });
        ELEMENTS.clientSelect.addEventListener('change', () => {
            if (ELEMENTS.clientSelect.value != "new") {
                ELEMENTS.clientNameContainer.classList.add('hidden');
                ELEMENTS.clientName.value = ELEMENTS.clientSelect.value;
            }
            else {
                ELEMENTS.clientNameContainer.classList.remove('hidden');
                ELEMENTS.clientName.value = "";
                ELEMENTS.clientName.focus();
            }
        });
        if (currentClient != "" && currentClient != "new") {
            ELEMENTS.clientSelect.value = currentClient;
            ELEMENTS.clientNameContainer.classList.add('hidden');
            ELEMENTS.clientName.value = currentClient;
        }
    });
}
function setUploadBtns() {
    ELEMENTS.docUploadBtnVisual.addEventListener('click', () => {
        ELEMENTS.docUploadBtnActual.click();
    });
    ELEMENTS.docUploadBtnActual.addEventListener('change', () => {
        const file = ELEMENTS.docUploadBtnActual.files[0];
        ELEMENTS.docUploadFilename.innerText = file.name;
        const fileSize = file.size / 1024 / 1024; // in MB
        if (fileSize > 100) {
            new notifications.NotificationMsg().displayNotification("File size too large. Max size is 100MB.");
            ELEMENTS.docUploadBtnActual.value = "";
            ELEMENTS.docUploadFilename.innerText = "No File Selected";
        }
    });
    ELEMENTS.templateUploadBtnVisual.addEventListener('click', () => {
        ELEMENTS.templateUploadBtnActual.click();
    });
    ELEMENTS.templateUploadBtnActual.addEventListener('change', () => {
        const file = ELEMENTS.templateUploadBtnActual.files[0];
        ELEMENTS.templateUploadFilename.innerText = file.name;
        const fileSize = file.size / 1024 / 1024; // in MB
        if (fileSize > 100) {
            new notifications.NotificationMsg().displayNotification("File size too large. Max size is 100MB.");
            ELEMENTS.templateUploadBtnActual.value = "";
            ELEMENTS.templateUploadFilename.innerText = "No File Selected";
        }
    });
}
function setSubmitBtn() {
    ELEMENTS.form.addEventListener('submit', (event) => __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        if (!STATE.sendAllowed) {
            return;
        }
        STATE.sendAllowed = false;
        const response = yield sendForm(ELEMENTS.form);
        STATE.sendAllowed = true;
        if (response.status == "error") {
            new notifications.NotificationMsg().displayNotification(response.error);
            return;
        }
        if (response.status == "ok") {
            if (STATE.isEditSession) {
                var msg = "Spec successfully updated.";
            }
            else {
                var msg = "New Spec successfully created.";
            }
            new notifications.NotificationMsg(() => {
                const specNameElement = document.getElementById('input-specName');
                window.location.href = `/nav/view?spec=${specNameElement.value}`;
            }).displayNotification(msg);
            return;
        }
    }));
}
function loadEditSpec() {
    return __awaiter(this, void 0, void 0, function* () {
        const currentUrl = new URLSearchParams(window.location.search);
        const specName = currentUrl.get('spec');
        if (!specName)
            return false;
        yield loading.loadSpec(specName, ELEMENTS.form, ELEMENTS.clientSelect);
        if (currentUrl.get('clone')) {
            return false;
        }
        else {
            return true;
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield setClientDropdown();
        setUploadBtns();
        setSubmitBtn();
        STATE.isEditSession = yield loadEditSpec();
    });
}
main();
