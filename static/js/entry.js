"use strict";
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
    uploadBtnVisual: document.getElementById('input-docUpload-visual'),
    uploadBtnActual: document.getElementById('input-docUpload-actual'),
    uploadFilename: document.getElementById('input-docUpload-filename'),
    notificationContainer: document.getElementById('notification-container'),
    notificationBlur: document.getElementById('notification-blur'),
    notificationBtnReload: document.getElementById('notification-btn-reload')
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
    ELEMENTS.notificationContainer.classList.remove('hidden');
    ELEMENTS.notificationBlur.classList.remove('hidden');
    console.log("Connection closed");
};
STATE.CONNECTION.onerror = (e) => {
    ELEMENTS.notificationContainer.classList.remove('hidden');
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
function main() {
    ELEMENTS.notificationBtnReload.addEventListener('click', () => {
        window.location.reload();
    });
    ELEMENTS.form.addEventListener('submit', (event) => __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        if (!STATE.sendAllowed) {
            return;
        }
        STATE.sendAllowed = false;
        const response = yield sendForm(ELEMENTS.form);
        STATE.sendAllowed = true;
        console.log(response);
    }));
    ELEMENTS.uploadBtnVisual.addEventListener('click', () => {
        ELEMENTS.uploadBtnActual.click();
    });
    ELEMENTS.uploadBtnActual.addEventListener('change', () => {
        const file = ELEMENTS.uploadBtnActual.files[0];
        ELEMENTS.uploadFilename.innerText = file.name;
    });
}
main();
