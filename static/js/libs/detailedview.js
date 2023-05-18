export { display };
const ELEMENTS = {
    container: document.getElementById('details-full-container'),
    general: document.getElementById('details-general'),
    formatting: document.getElementById('details-formatting'),
    video: document.getElementById('details-video'),
    audio: document.getElementById('details-audio'),
    subcap: document.getElementById('details-subcap'),
    metadata: document.getElementById('details-metadata'),
    additional: document.getElementById('details-additional'),
};
function display(spec) {
    clear();
    general(spec);
    formatting(spec);
}
function clear() {
    for (const section in ELEMENTS) {
        if (ELEMENTS[section] == ELEMENTS.container)
            continue;
        ELEMENTS[section].innerHTML = "";
    }
}
function createSection(name, parent) {
    const sectionHeader = document.createElement('h2');
    sectionHeader.classList.add('details-section-header');
    sectionHeader.innerText = name;
    parent.append(sectionHeader, document.createElement('hr'));
    const sectionContainer = document.createElement('div');
    sectionContainer.classList.add('details-section-container');
    parent.append(sectionContainer);
    return sectionContainer;
}
function createTextSubItem(label, value, oneline) {
    const subItemContainer = document.createElement('div');
    subItemContainer.classList.add('details-subItem-container');
    const labelElem = document.createElement('label');
    labelElem.innerText = label;
    subItemContainer.append(labelElem);
    const subItemValue = document.createElement('p');
    subItemValue.innerText = value ? value : "N/A";
    subItemContainer.append(subItemValue);
    if (oneline) {
        subItemContainer.classList.add('details-subItem-block');
    }
    return subItemContainer;
}
function createIsRequiredSubItem(label, required, details) {
    const subItemContainer = document.createElement('div');
    subItemContainer.classList.add('details-subItem-container');
    const labelElem = document.createElement('label');
    labelElem.innerText = label;
    subItemContainer.append(labelElem);
    const subItemValue = document.createElement('p');
    if (required) {
        subItemContainer.classList.add('details-subItem-block');
        subItemValue.innerText = details ? details : "Required";
    }
    else {
        subItemValue.innerText = "N/A";
    }
    subItemContainer.append(subItemValue);
    return subItemContainer;
}
function base64ToBinary(b64str) {
    const decodedString = atob(b64str);
    const binaryData = new Uint8Array(decodedString.length);
    for (let i = 0; i < decodedString.length; i++) {
        binaryData[i] = decodedString.charCodeAt(i);
    }
    return binaryData;
}
function base64ToURL(b64str, apptype) {
    const apptypeStr = apptype ? apptype : 'application/pdf';
    const binaryData = base64ToBinary(b64str);
    const url = URL.createObjectURL(new Blob([binaryData], { type: apptypeStr }));
    return url;
}
function createFileSubItem(label, filename, base64str, oneline) {
    if (!filename) {
        return createTextSubItem(label, "N/A", oneline);
    }
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
function general(spec) {
    const sectionContainer = createSection("General", ELEMENTS.general);
    sectionContainer.append(createTextSubItem("Client", spec.client_name));
    sectionContainer.append(createTextSubItem("Spec", spec.name));
    sectionContainer.append(createTextSubItem("Created", spec.created));
    sectionContainer.append(createTextSubItem("Updated", spec.updated));
    sectionContainer.append(createFileSubItem("Source", spec.source_filename, spec.source));
    sectionContainer.append(createTextSubItem("Description", spec.description, true));
}
function formatting(spec) {
    const formattingContainer = createSection("Formatting", ELEMENTS.formatting);
    formattingContainer.append(createTextSubItem("Head/Tail", spec.headtailbuild, true));
    formattingContainer.append(createIsRequiredSubItem("Act/Commercial Breaks", spec.act_breaks_required, spec.act_breaks_details));
}
