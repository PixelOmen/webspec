import * as fetchDB from "./libs/fetchDB.js";
import * as loading from './libs/loading.js';
import * as notifications from './libs/notifications.js';
export {};

const ELEMENTS = {
    form: document.getElementById('form-main') as HTMLFormElement,
    clientSelect: document.getElementById('select-client') as HTMLSelectElement,
    clientName: document.getElementById('input-clientName') as HTMLInputElement,
    clientNameContainer: document.getElementById('input-clientName-container') as HTMLInputElement,
    docUploadBtnVisual: document.getElementById('input-docUpload-visual') as HTMLFormElement,
    docUploadBtnActual: document.getElementById('input-docUpload-actual') as HTMLFormElement,
    docUploadFilename: document.getElementById('input-docUpload-filename') as HTMLFormElement,
    templateUploadBtnVisual: document.getElementById('input-templateUpload-visual') as HTMLFormElement,
    templateUploadBtnActual: document.getElementById('input-templateUpload-actual') as HTMLFormElement,
    templateUploadFilename: document.getElementById('input-templateUpload-filename') as HTMLFormElement,
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

async function sendForm(form: HTMLFormElement): Promise<any> {
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
}


async function setClientDropdown() {
    const response = await fetchDB.fetchClients();
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
            ELEMENTS.clientName.focus();
        }
    });

    if (currentClient != "" && currentClient != "new") {
        ELEMENTS.clientSelect.value = currentClient;
        ELEMENTS.clientNameContainer.classList.add('hidden');
        ELEMENTS.clientName.value = currentClient;
    }
}

function setUploadBtns() {
    ELEMENTS.docUploadBtnVisual.addEventListener('click', () => {
        ELEMENTS.docUploadBtnActual.click();
    });
    ELEMENTS.docUploadBtnActual.addEventListener('change', () => {
        const file = ELEMENTS.docUploadBtnActual.files[0];
        ELEMENTS.docUploadFilename.innerText = file.name;
    });
    ELEMENTS.templateUploadBtnVisual.addEventListener('click', () => {
        ELEMENTS.templateUploadBtnActual.click();
    });
    ELEMENTS.templateUploadBtnActual.addEventListener('change', () => {
        const file = ELEMENTS.templateUploadBtnActual.files[0];
        ELEMENTS.templateUploadFilename.innerText = file.name;
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
            if (STATE.isEditSession) {
                var msg = "Spec successfully updated."
            } else {
                var msg = "New Spec successfully created.";
            }
            new notifications.NotificationMsg(() => {
                window.location.href = `/`;
            }).displayNotification(msg);
            return;
        }
    });
}

async function loadEditSpec(): Promise<boolean> {
    const currentUrl = new URLSearchParams(window.location.search);
    const specName = currentUrl.get('spec');
    if (!specName) return false;
    await loading.loadSpec(specName, ELEMENTS.form, ELEMENTS.clientSelect);
    if (currentUrl.get('clone')) {
        return false;
    } else {
        return true;
    }
}


async function main() {
    await setClientDropdown();
    setUploadBtns();
    setSubmitBtn();
    STATE.isEditSession = await loadEditSpec();
}

main();