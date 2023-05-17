export { Spec, display };

interface Spec {
    [key: string]: any;
    source: string; //Base64 encoded string
}

const ELEMENTS: { [key: string]: HTMLDivElement} = {
    container: document.getElementById('details-full-container') as HTMLDivElement,
    general: document.getElementById('details-general') as HTMLDivElement,
    formatting: document.getElementById('details-formatting') as HTMLDivElement,
    video: document.getElementById('details-video') as HTMLDivElement,
    audio: document.getElementById('details-audio') as HTMLDivElement,
    subcap: document.getElementById('details-subcap') as HTMLDivElement,
    metadata: document.getElementById('details-metadata') as HTMLDivElement,
    additional: document.getElementById('details-additional') as HTMLDivElement,
    notes: document.getElementById('details-notes') as HTMLDivElement
}

function display(spec: Spec): void {
    clear();
    general(spec);
}

function clear(): void {
    for (const section in ELEMENTS) {
        if (ELEMENTS[section] == ELEMENTS.container) continue;
        ELEMENTS[section].innerHTML = "";
    }
}

function createSection(name: string, parent: HTMLDivElement): HTMLDivElement {
    const sectionHeader = document.createElement('h2');
    sectionHeader.classList.add('details-section-header');
    sectionHeader.innerText = name;
    parent.append(sectionHeader, document.createElement('hr'));
    const sectionContainer = document.createElement('div');
    sectionContainer.classList.add('details-section-container');
    parent.append(sectionContainer);
    return sectionContainer;
}

function createTextSubItem(label: string, value: string, oneline?: boolean): HTMLDivElement {
    const subItemContainer = document.createElement('div');
    subItemContainer.classList.add('details-subItem-container');
    const labelElem = document.createElement('label');
    labelElem.innerText = label;
    subItemContainer.append(labelElem);
    const subItemValue = document.createElement('p');
    subItemValue.innerText = value;
    subItemContainer.append(subItemValue);
    if (oneline) {
        subItemContainer.classList.add('details-subItem-block');
    }
    return subItemContainer;
}

function base64ToBinary(b64str: string): Uint8Array {
    const decodedString = atob(b64str);
    const binaryData = new Uint8Array(decodedString.length);
    for (let i = 0; i < decodedString.length; i++) {
        binaryData[i] = decodedString.charCodeAt(i);
    }
    return binaryData;
}

function base64ToURL(b64str: string, apptype?: string): string {
    const apptypeStr = apptype ? apptype : 'application/pdf';
    const binaryData = base64ToBinary(b64str);
    const url = URL.createObjectURL(new Blob([binaryData], { type: apptypeStr }));
    return url;
}

function createFileSubItem(label: string, filename: string, base64str: string, oneline?: boolean): HTMLDivElement {
    const fileURL = base64ToURL(base64str);
    const subItemContainer = document.createElement('div');
    subItemContainer.classList.add('details-subItem-container');
    const labelElem = document.createElement('label');
    labelElem.innerText = label;
    subItemContainer.append(labelElem);
    const fileAnchor = document.createElement('a');
    fileAnchor.target = "_blank";
    fileAnchor.href = fileURL;
    fileAnchor.innerText = filename;
    subItemContainer.append(fileAnchor);
    if (oneline) {
        subItemContainer.classList.add('details-subItem-block');
    }
    return subItemContainer;
}


function general(spec: Spec): void {
    const sectionContainer = createSection("General", ELEMENTS.general);
    sectionContainer.append(createTextSubItem("Name", spec.name, true));
    sectionContainer.append(createTextSubItem("Description", spec.description, true));
    sectionContainer.append(createTextSubItem("Created", spec.created));
    sectionContainer.append(createTextSubItem("Updated", spec.updated));
    sectionContainer.append(createFileSubItem("Source", spec.source_filename, spec.source));
}