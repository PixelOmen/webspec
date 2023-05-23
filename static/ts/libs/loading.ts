import * as fetchDB from "./fetchDB.js";
import * as detailedView from './detailedview.js';
import * as notifications from './notifications.js';

interface NamedElement extends Element {
    name: string;
}

function assertExists(spec: fetchDB.Spec, element: NamedElement): boolean {
    const found = spec.hasOwnProperty(element.name);
    if (!found) {
        throw new Error(`Not Found: ${element.name}`);
    }
    return true;
}

function setSource(spec: fetchDB.Spec): void {
    const source = spec.source;
    if (!source) return;
    const msg = "** Warning **<br><br> Due to browser security restrictions, " +
                "the original source document must be uploaded again in order to edit this spec " +
                "and also retain the document. <br><br>" + 
                "Note that the current document is always available to download via the 'Browse' page.";
    new notifications.NotificationMsg().displayNotification(msg);
}

export async function loadSpec(form: HTMLFormElement, clientSelect: HTMLSelectElement): Promise<boolean> {
    const currentUrl = new URLSearchParams(window.location.search);
    const specName = currentUrl.get('spec');
    if (!specName) return false;
    const spec = await fetchDB.fetchSpec(specName);
    if (spec.status != "ok") {
        throw new Error(spec.error);
    }
    setSource(spec.output.specs[0]);
    for (const formElem of form.elements) {
        switch (true) {
            case formElem instanceof HTMLInputElement:
                if (formElem.id == "input-docUpload-actual") break;
                const inputElem = formElem as HTMLInputElement;
                assertExists(spec.output.specs[0], inputElem);
                const value = spec.output.specs[0][inputElem.name];
                if (inputElem.type == "checkbox") {
                    inputElem.checked = value;
                } else {
                    inputElem.value = value;
                }
                break;
            case formElem instanceof HTMLSelectElement:
                const selectElem = formElem as HTMLSelectElement;
                if (selectElem.name != "Client") {
                    throw new Error("Only Client dropdown has been implemented on Spec load")
                }
                clientSelect.value = spec.output.specs[0]["client_name"];
                clientSelect.dispatchEvent(new Event('change'));
                break;
            case formElem instanceof HTMLTextAreaElement:
                const textareaElem = formElem as HTMLTextAreaElement;
                assertExists(spec.output.specs[0], textareaElem);
                textareaElem.value = spec.output.specs[0][textareaElem.name];
                break;
            case formElem instanceof HTMLButtonElement:
                break;
            default:
                console.error("Unknown form element on Spec load: ", formElem);
        }
    }
    return true;
}