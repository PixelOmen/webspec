var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchDB from "./fetchDB.js";
import * as notifications from './notifications.js';
function assertExists(spec, element) {
    const found = spec.hasOwnProperty(element.name);
    if (!found) {
        throw new Error(`Not Found: ${element.name}`);
    }
    return true;
}
function setSource(spec) {
    const source = spec.source;
    if (!source)
        return;
    const msg = "** Warning **<br><br> Due to browser security restrictions, " +
        "the original source document must be uploaded again in order to edit this spec " +
        "and also retain the document. <br><br>" +
        "Note that the current document is always available to download via the 'Browse' page.";
    new notifications.NotificationMsg().displayNotification(msg);
}
export function loadSpec(form, clientSelect) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentUrl = new URLSearchParams(window.location.search);
        const specName = currentUrl.get('spec');
        if (!specName)
            return false;
        const spec = yield fetchDB.fetchSpec(specName);
        if (spec.status != "ok") {
            throw new Error(spec.error);
        }
        setSource(spec.output.specs[0]);
        for (const formElem of form.elements) {
            switch (true) {
                case formElem instanceof HTMLInputElement:
                    if (formElem.id == "input-docUpload-actual")
                        break;
                    const inputElem = formElem;
                    assertExists(spec.output.specs[0], inputElem);
                    const value = spec.output.specs[0][inputElem.name];
                    if (inputElem.type == "checkbox") {
                        inputElem.checked = value;
                    }
                    else {
                        inputElem.value = value;
                    }
                    break;
                case formElem instanceof HTMLSelectElement:
                    const selectElem = formElem;
                    if (selectElem.name != "Client") {
                        throw new Error("Only Client dropdown has been implemented on Spec load");
                    }
                    clientSelect.value = spec.output.specs[0]["client_name"];
                    clientSelect.dispatchEvent(new Event('change'));
                    break;
                case formElem instanceof HTMLTextAreaElement:
                    const textareaElem = formElem;
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
    });
}
