const myform = document.getElementById('form-main') as HTMLFormElement;
const uploadBtn = document.getElementById('input-docUpload-visual') as HTMLFormElement;

function formToObject(form: HTMLFormElement) {
    const formData = new FormData(form);
    const obj: {[key: string]: FormDataEntryValue | boolean} = {};
    for (const [key, value] of formData.entries()) {
        obj[key] = value;
    }
    const elements = form.querySelectorAll('input[type="checkbox"]');
    const checkboxes = elements as NodeListOf<HTMLInputElement>;
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