import * as view from './view.js';
import * as notifications from './libs/notifications.js';
export {};

const ELEMENTS = {
    form: document.getElementById('form-main') as HTMLFormElement,
    clientSelect: document.getElementById('select-client') as HTMLSelectElement,
    clientName: document.getElementById('input-clientName') as HTMLInputElement,
    clientNameContainer: document.getElementById('input-clientName-container') as HTMLInputElement,
    uploadBtnVisual: document.getElementById('input-docUpload-visual') as HTMLFormElement,
    uploadBtnActual: document.getElementById('input-docUpload-actual') as HTMLFormElement,
    uploadFilename: document.getElementById('input-docUpload-filename') as HTMLFormElement,
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
    let msg = "Connection lost. Please try refreshing the page.";
    new notifications.NotificationMsg(() => {
        window.location.reload();
    }).displayNotification(msg);
    console.log("Connection closed");
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

async function fetchClients(): Promise<view.ClientResponse> {
    return fetch("/query/clients/all")
    .then((res) => { return res.json(); })
    .then((data) => { return data; });
}

function formToFormData(form: HTMLFormElement): FormData {
    const formData = new FormData(form);
    const jsonobj: {[key: string]: FormDataEntryValue | boolean} = {"sessionID": STATE.sessionID};
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            continue;
        }
        jsonobj[key] = value;
    }
    const elements = form.querySelectorAll('input[type="checkbox"]');
    const checkboxes = elements as NodeListOf<HTMLInputElement>;
    for (const checkbox of checkboxes) {
        jsonobj[checkbox.name] = checkbox.checked;
    }
    formData.append("jsonData", JSON.stringify(jsonobj));
    return formData;
}

function sendForm(form: HTMLFormElement): Promise<any> {
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


async function setClientDropdown() {
    const response = await fetchClients();
    if (response.status !== "ok") {
        console.error(response.error);
        return;
    }

    if (ELEMENTS.clientSelect.value == "new") {
        var currentClient = ELEMENTS.clientName.value;
    } else {
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
    clients.forEach((client: any) => {
        const option = document.createElement('option');
        option.value = client;
        option.innerText = client;
        ELEMENTS.clientSelect.appendChild(option);
    });
    ELEMENTS.clientSelect.addEventListener('change', () => {
        if (ELEMENTS.clientSelect.value != "new") {
            ELEMENTS.clientNameContainer.classList.add('hidden');
            ELEMENTS.clientName.value = ELEMENTS.clientSelect.value;
        } else {
            ELEMENTS.clientNameContainer.classList.remove('hidden');
            ELEMENTS.clientName.value = "";
        }
    });

    if (currentClient != "" && currentClient != "new") {
        ELEMENTS.clientSelect.value = currentClient;
        ELEMENTS.clientNameContainer.classList.add('hidden');
        ELEMENTS.clientName.value = currentClient;
    }
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
    ELEMENTS.form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!STATE.sendAllowed) {
            return;
        }
        STATE.sendAllowed = false;
        const response = await sendForm(ELEMENTS.form);
        STATE.sendAllowed = true;
        if (response.status == "error") {
            new notifications.NotificationMsg().displayNotification(response.error);
            return;
        }
        if (response.status == "ok") {
            const msg = "New Spec successfully created.";
            new notifications.NotificationMsg().displayNotification(msg);
            setClientDropdown();
            return;
        }
    });
}


function main() {
    setClientDropdown();
    setUploadBtn();
    setSubmitBtn();
}

main();