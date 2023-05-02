"use strict";
const ELEMENTS = {
    form: document.getElementById('form-main'),
    uploadBtnVisual: document.getElementById('input-docUpload-visual'),
    uploadBtnActual: document.getElementById('input-docUpload-actual')
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
    console.log("Connection closed");
};
STATE.CONNECTION.onerror = (e) => {
    console.error(e);
};
STATE.CONNECTION.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    console.log(data);
    if (data.type === "sessionID") {
        STATE.sessionID = data.sessionID;
        return;
    }
    if (data.type === "upload") {
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
function main() {
    ELEMENTS.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = formToFormData(ELEMENTS.form);
        fetch('/upload', {
            method: 'POST',
            body: formData,
        }).then((res) => { return res.json(); }).then((data) => {
            console.log(data);
        });
    });
    ELEMENTS.uploadBtnVisual.addEventListener('click', () => {
        ELEMENTS.uploadBtnActual.click();
    });
}
main();
