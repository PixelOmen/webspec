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
    form: document.getElementById('form-main'),
    clientSelect: document.getElementById('select-client'),
    clientName: document.getElementById('input-clientName'),
    clientNameContainer: document.getElementById('input-clientName-container'),
    uploadBtnVisual: document.getElementById('input-docUpload-visual'),
    uploadBtnActual: document.getElementById('input-docUpload-actual'),
    uploadFilename: document.getElementById('input-docUpload-filename'),
    notificationBlur: document.getElementById('notification-blur'),
    notificationContainer: document.getElementById('notification-container-generic'),
    notificationMessage: document.getElementById('notification-message'),
    notificationBtnClose: document.getElementById('notification-btn-close'),
    notificationDisconnect: document.getElementById('notification-container-disconnect'),
    notificationBtnReload: document.getElementById('notification-btn-reload'),
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
function displayNotification(msg) {
    ELEMENTS.notificationContainer.classList.remove('hidden');
    ELEMENTS.notificationBlur.classList.remove('hidden');
    ELEMENTS.notificationMessage.innerHTML = `<p>${msg}</p>`;
}
function formToFormData(form) {
    const formData = new FormData(form);
    const jsonobj = { "sessionID": STATE.sessionID };
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            continue;
        }
        jsonobj[key] = value;
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
    const formData = formToFormData(form);
    return fetch('/upload', {
        method: 'POST',
        body: formData,
    }).then((res) => {
        return res.json();
    }).then((data) => {
        return data;
    });
}
function setNotificationContainer() {
    ELEMENTS.notificationBtnReload.addEventListener('click', () => {
        window.location.reload();
    });
    ELEMENTS.notificationBtnClose.addEventListener('click', () => {
        ELEMENTS.notificationContainer.classList.add('hidden');
        ELEMENTS.notificationBlur.classList.add('hidden');
    });
}
function setClientDropdown() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("/query/clients/all")
            .then((res) => { return res.json(); })
            .then((data) => { return data; });
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
            }
        });
        if (currentClient != "" && currentClient != "new") {
            ELEMENTS.clientSelect.value = currentClient;
            ELEMENTS.clientNameContainer.classList.add('hidden');
            ELEMENTS.clientName.value = currentClient;
        }
    });
}
function setUploadBtn() {
    ELEMENTS.uploadBtnVisual.addEventListener('click', () => {
        ELEMENTS.uploadBtnActual.click();
    });
    ELEMENTS.uploadBtnActual.addEventListener('change', () => {
        const file = ELEMENTS.uploadBtnActual.files[0];
        ELEMENTS.uploadFilename.innerText = file.name;
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
            displayNotification(response.error);
            return;
        }
        if (response.status == "ok") {
            displayNotification("New Spec successfully created.");
            setClientDropdown();
            return;
        }
    }));
}
function main() {
    setNotificationContainer();
    setClientDropdown();
    setUploadBtn();
    setSubmitBtn();
}
main();
export {};
