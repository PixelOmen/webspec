const ELEMENTS = {
    form: document.getElementById('form-main') as HTMLFormElement,
    clientSelect: document.getElementById('select-client') as HTMLSelectElement,
    clientName: document.getElementById('input-clientName') as HTMLInputElement,
    clientNameContainer: document.getElementById('input-clientName-container') as HTMLInputElement,
    uploadBtnVisual: document.getElementById('input-docUpload-visual') as HTMLFormElement,
    uploadBtnActual: document.getElementById('input-docUpload-actual') as HTMLFormElement,
    uploadFilename: document.getElementById('input-docUpload-filename') as HTMLFormElement,
    notificationBlur: document.getElementById('notification-blur') as HTMLDivElement,
    notificationContainer: document.getElementById('notification-container-generic') as HTMLDivElement,
    notificationMessage: document.getElementById('notification-message') as HTMLDivElement,
    notificationBtnClose: document.getElementById('notification-btn-close') as HTMLButtonElement,
    notificationDisconnect: document.getElementById('notification-container-disconnect') as HTMLDivElement,
    notificationBtnReload: document.getElementById('notification-btn-reload') as HTMLButtonElement,
}

const STATE = {
    CONNECTION: new WebSocket(`ws://${window.location.host}/connect`),
    sessionID: "",
    sendAllowed: true,
    username: "",
    password: ""
}
STATE.CONNECTION.onopen = () => {
    console.log("Connection open");
}
STATE.CONNECTION.onclose = () => {
    ELEMENTS.notificationDisconnect.classList.remove('hidden');
    ELEMENTS.notificationBlur.classList.remove('hidden');
    console.log("Connection closed");
}
STATE.CONNECTION.onerror = (e) => {
    ELEMENTS.notificationDisconnect.classList.remove('hidden');
    ELEMENTS.notificationBlur.classList.remove('hidden');
    console.error(e);
}
STATE.CONNECTION.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.type === "sessionID") {
        STATE.sessionID = data.sessionID;
        return;
    }
    if (data.type === "debug") {
        console.log(data.msg);
    }
}

function displayNotification(msg: string) {
    ELEMENTS.notificationContainer.classList.remove('hidden');
    ELEMENTS.notificationBlur.classList.remove('hidden');
    ELEMENTS.notificationMessage.innerHTML = `<p>${msg}</p>`;
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

function setNotificationContainer() {
    ELEMENTS.notificationBtnReload.addEventListener('click', () => {
        window.location.reload();
    });
    ELEMENTS.notificationBtnClose.addEventListener('click', () => {
        ELEMENTS.notificationContainer.classList.add('hidden');
        ELEMENTS.notificationBlur.classList.add('hidden');
    });
}


async function setClientDropdown() {
    const response = await fetch("/query/clients/all")
        .then((res) => { return res.json(); })
        .then((data) => { return data; });
    if (response.status !== "ok") {
        console.error(response.error);
        return;
    }
    ELEMENTS.clientSelect.innerHTML = "";
    const defaultOption = document.createElement('option');
    defaultOption.value = "new";
    defaultOption.innerText = "New";
    ELEMENTS.clientSelect.appendChild(defaultOption);
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
            displayNotification(response.error);
            return;
        }
        if (response.status == "ok") {
            displayNotification("New Spec successfully created.");
            setClientDropdown();
            return;
        }
    });
}


function main() {
    setNotificationContainer();
    setClientDropdown();
    setUploadBtn();
    setSubmitBtn();
}

main();