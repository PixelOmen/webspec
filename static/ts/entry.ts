const ELEMENTS = {
    form: document.getElementById('form-main') as HTMLFormElement,
    uploadBtnVisual: document.getElementById('input-docUpload-visual') as HTMLFormElement,
    uploadBtnActual: document.getElementById('input-docUpload-actual') as HTMLFormElement,
    uploadFilename: document.getElementById('input-docUpload-filename') as HTMLFormElement,
    notificationContainer: document.getElementById('notification-container') as HTMLDivElement,
    notificationBlur: document.getElementById('notification-blur') as HTMLDivElement,
    notificationBtnReload: document.getElementById('notification-btn-reload') as HTMLButtonElement
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
    ELEMENTS.notificationContainer.classList.remove('hidden');
    ELEMENTS.notificationBlur.classList.remove('hidden');
    console.log("Connection closed");
}
STATE.CONNECTION.onerror = (e) => {
    ELEMENTS.notificationContainer.classList.remove('hidden');
    ELEMENTS.notificationBlur.classList.remove('hidden');
    console.error(e);
}
STATE.CONNECTION.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.type === "sessionID") {
        STATE.sessionID = data.sessionID;
        return;
    }
    if (data.type === "upload") {
        console.log(data.msg);
    }
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

function main() {
    ELEMENTS.notificationBtnReload.addEventListener('click', () => {
        window.location.reload();
    });
    ELEMENTS.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = formToFormData(ELEMENTS.form);
        fetch('/upload', {
            method: 'POST',
            body: formData,
        }).then((res) => { return res.json() }).then((data) => {
            console.log(data);
        });
    });

    ELEMENTS.uploadBtnVisual.addEventListener('click', () => {
        ELEMENTS.uploadBtnActual.click();
    });
    ELEMENTS.uploadBtnActual.addEventListener('change', () => {
        const file = ELEMENTS.uploadBtnActual.files[0];
        ELEMENTS.uploadFilename.innerText = file.name;
    });
}

main();