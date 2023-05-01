"use strict";
const myform = document.getElementById('form-main');
const uploadBtn = document.getElementById('input-docUpload-visual');
function formToObject(form) {
    const formData = new FormData(form);
    const obj = {};
    for (const [key, value] of formData.entries()) {
        obj[key] = value;
    }
    const elements = form.querySelectorAll('input[type="checkbox"]');
    const checkboxes = elements;
    for (const checkbox of checkboxes) {
        obj[checkbox.name] = checkbox.checked;
    }
    return obj;
}
myform.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = formToObject(myform);
    console.log(formData);
});
uploadBtn.addEventListener('click', () => {
    console.log("uploadbtn clicked");
});
