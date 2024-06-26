import * as fetchDB from "./fetchDB.js";
export { display, base64ToBinary };

const ELEMENTS: { [key: string]: HTMLElement } = {
    container: document.getElementById('details-full-container') as HTMLDivElement,
    general: document.getElementById('details-general') as HTMLDivElement,
    formatting: document.getElementById('details-formatting') as HTMLDivElement,
    video: document.getElementById('details-video') as HTMLDivElement,
    audio: document.getElementById('details-audio') as HTMLDivElement,
    metadata: document.getElementById('details-metadata') as HTMLDivElement,
    additional: document.getElementById('details-additional') as HTMLDivElement,
    editBtn: document.getElementById('btn-edit') as HTMLButtonElement,
    cloneBtn: document.getElementById('btn-clone') as HTMLButtonElement
}

function createSection(name: string, parent: HTMLElement): HTMLDivElement {
    const sectionHeader = document.createElement('h2');
    sectionHeader.classList.add('details-section-header');
    sectionHeader.innerText = name;
    parent.append(sectionHeader, document.createElement('hr'));
    const sectionContainer = document.createElement('div');
    sectionContainer.classList.add('details-section-container');
    parent.append(sectionContainer);
    return sectionContainer;
}

function createSubItem(label: string): {"container": HTMLDivElement, "value": HTMLParagraphElement} {
    const subItemContainer = document.createElement('div');
    subItemContainer.classList.add('details-subItem-container');
    const labelElem = document.createElement('label');
    labelElem.innerText = label;
    subItemContainer.append(labelElem);
    const subItemValue = document.createElement('p');
    subItemContainer.append(subItemValue);
    return {
        "container": subItemContainer,
        "value": subItemValue
    };
}

function createTextSubItem(label: string, value: string, oneLine?: boolean,
                            center?: boolean, emptyOneLine?: boolean): HTMLDivElement {
    const subItem = createSubItem(label);
    subItem.value.innerText = value ? value : "N/A";
    subItem.container.append(subItem.value);
    if ((oneLine && value) || (emptyOneLine && !value)) {
        subItem.container.classList.add('details-subItem-block');
    }
    if (center || !value) {
        subItem.value.style.textAlign = "center";
    }
    if (!value) {
        subItem.container.classList.add('details-subItem-emptyValue');
    }
    return subItem.container;
}

function createBoolSubItem(label: string, value: boolean): HTMLDivElement {
    const subItem = createSubItem(label);
    subItem.value.innerText = value ? "Required" : "N/A";
    subItem.value.style.textAlign = "center";
    if (!value) {
        subItem.container.classList.add('details-subItem-emptyValue');
    }
    return subItem.container;
}

function createIsRequiredSubItem(label: string, required: boolean, details: string,
                                forceOneLine?: boolean, center?: boolean): HTMLDivElement {
    const subItem = createSubItem(label);
    if (required) { 
        subItem.value.innerText = details ? details : "Required";
    } else {
        subItem.value.innerText = "N/A";
        subItem.container.classList.add('details-subItem-emptyValue');
    }
    if (forceOneLine && details) {
        subItem.container.classList.add('details-subItem-block');
    }
    if (center || !details) {
        subItem.value.style.textAlign = "center";
    }
    return subItem.container;
}

function base64ToBinary(b64str: string): Uint8Array {
    const decodedString = atob(b64str);
    const binaryData = new Uint8Array(decodedString.length);
    for (let i = 0; i < decodedString.length; i++) {
        binaryData[i] = decodedString.charCodeAt(i);
    }
    return binaryData;
}

function base64ToURL(b64str: string, extension: string): string {
    const binaryData = base64ToBinary(b64str);
    const apptype = extension == "pdf" ? "application/pdf" : undefined;
    if (apptype == "application/pdf") {
        var url = URL.createObjectURL(new Blob([binaryData], { type: apptype }));
    } else {
        var url = URL.createObjectURL(new Blob([binaryData]));
    }
    return url;
}

function createFileSubItem(label: string, filename: string, base64str: string,
                                                oneline?: boolean): HTMLDivElement {

    if (!filename) return createTextSubItem(label, "", oneline);

    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) {
        throw new Error(`Could not get extension from filename: ${filename}`);
    }
    const fileURL = base64ToURL(base64str, ext);
    const subItemContainer = document.createElement('div');
    subItemContainer.classList.add('details-subItem-container');
    const labelElem = document.createElement('label');
    labelElem.innerText = label;
    subItemContainer.append(labelElem);
    const fileAnchor = document.createElement('a');
    fileAnchor.href = fileURL;
    fileAnchor.innerText = filename;
    if ((navigator.userAgent.indexOf("Edg") != -1 ||
        navigator.userAgent.indexOf("Chrome") != -1 ||
        navigator.userAgent.indexOf("Firefox") != -1) && ext == "pdf") {
        fileAnchor.target = "_blank";
    } else {
        fileAnchor.download = filename;
    }
    subItemContainer.append(fileAnchor);
    if (oneline) {
        subItemContainer.classList.add('details-subItem-block');
    }
    fileAnchor.style.textAlign = "center";
    return subItemContainer;
}


function general(spec: fetchDB.Spec): void {
    const sectionContainer = createSection("General", ELEMENTS.general);
    sectionContainer.append(createTextSubItem("Spec ID", spec.id, false, true));
    sectionContainer.append(createTextSubItem("Spec Name", spec.name, false, true));
    sectionContainer.append(createTextSubItem("Client", spec.client_name, false, true));
    sectionContainer.append(createTextSubItem("Created", spec.created, false, true));
    sectionContainer.append(createTextSubItem("Updated", spec.updated, false, true));
    sectionContainer.append(createFileSubItem("Sources", spec.source_filename, spec.source));
    sectionContainer.append(createTextSubItem("Description", spec.description, true));
}

function formatting(spec: fetchDB.Spec): void {
    const sectionContainer = createSection("Formatting", ELEMENTS.formatting);
    sectionContainer.append(createTextSubItem("Start Timecode", spec.start_timecode, false, true));
    sectionContainer.append(createBoolSubItem("Dropframe", spec.dropframe));
    sectionContainer.append(createTextSubItem("Naming Convention", spec.naming_convention, true));
    sectionContainer.append(createIsRequiredSubItem("Subtitles/Captions", spec.subcap_required,
                                                                        spec.subcap_details, true));
    sectionContainer.append(createTextSubItem("Head/Tail", spec.headtailbuild, true));
    sectionContainer.append(createIsRequiredSubItem("Slate", spec.slate_required,
                                                                spec.slate_details, true));
    sectionContainer.append(createIsRequiredSubItem("Textless", spec.textless_required,
                                                                spec.textless_details, true));
    sectionContainer.append(createIsRequiredSubItem("Burn-ins", spec.burnins_required,
                                                                spec.burnins_details, true));
    sectionContainer.append(createIsRequiredSubItem("Forensic", spec.watermark_required,
                                                                spec.watermark_details, true));
    sectionContainer.append(createIsRequiredSubItem("Act/Commercial Breaks", spec.act_breaks_required,
                                                                            spec.act_breaks_details, true));
}

function video(spec: fetchDB.Spec): void {
    const sectionContainer = createSection("Video", ELEMENTS.video);
    sectionContainer.append(createTextSubItem("Resolution", spec.resolution, false, true));
    sectionContainer.append(createTextSubItem("Framerate", spec.framerate, false, true));
    sectionContainer.append(createTextSubItem("Aspect Ratio", spec.aspect_ratio, false, true));
    sectionContainer.append(createTextSubItem("Codec", spec.video_codec, false, true));
    sectionContainer.append(createTextSubItem("Profile", spec.video_codec_profile, false, true));
    sectionContainer.append(createTextSubItem("Bitrate", spec.video_bitrate, false, true));
    sectionContainer.append(createTextSubItem("Bitdepth", spec.video_bitdepth, false, true));
    sectionContainer.append(createTextSubItem("Colorspace", spec.colorspace, false, true));
    sectionContainer.append(createTextSubItem("Container", spec.video_container, false, true));
}

function audio(spec: fetchDB.Spec): void {
    const sectionContainer = createSection("Audio", ELEMENTS.audio);
    sectionContainer.append(createTextSubItem("Codec", spec.audio_codec, false, true));
    sectionContainer.append(createTextSubItem("Profile", spec.audio_codec_profile, false, true));
    sectionContainer.append(createTextSubItem("Bitrate", spec.audio_bitrate, false, true));
    sectionContainer.append(createTextSubItem("Bitdepth", spec.audio_bitdepth, false, true));
    sectionContainer.append(createBoolSubItem("LKFS", spec.lkfs));
    sectionContainer.append(createIsRequiredSubItem("Audio Description (AD)", spec.audio_description_required,
                                                                            spec.audio_description_details, true));
    sectionContainer.append(createTextSubItem("Container", spec.audio_container, false, true));
    sectionContainer.append(createTextSubItem("Audio Config", spec.audio_config, true, false, true));
    sectionContainer.append(createTextSubItem("Audio Details", spec.audio_details, true, false, true));
}

function metadata(spec: fetchDB.Spec): void {
    const sectionContainer = createSection("Metadata", ELEMENTS.metadata);
    sectionContainer.append(createBoolSubItem("QT Audio Flags", spec.audio_flags));
    sectionContainer.append(createBoolSubItem("V-chip", spec.vchip));
    sectionContainer.append(createBoolSubItem("AFD", spec.afd));
    sectionContainer.append(createIsRequiredSubItem("HDR Metadata", spec.hdr_metadata_required,
                                                                    spec.hdr_metadata_details, true));
    sectionContainer.append(createIsRequiredSubItem("Streaming Flags", spec.streaming_flags_required,
                                                                    spec.streaming_flags_details, true));
}

function additional(spec: fetchDB.Spec): void {
    const sectionContainer = createSection("Additional", ELEMENTS.additional);
    sectionContainer.append(createIsRequiredSubItem("Artwork", spec.artwork_required,
                                                                spec.artwork_details, true));
    sectionContainer.append(createIsRequiredSubItem("Reports/Forms", spec.reports_required,
                                                                    spec.reports_details, true));
    sectionContainer.append(createFileSubItem("Form Templates", spec.template_filename, spec.template));
    sectionContainer.append(createTextSubItem("Notes", spec.notes, true));
}


function clear(): void {
    for (const section in ELEMENTS) {
        if (ELEMENTS[section] == ELEMENTS.container || ELEMENTS[section] instanceof HTMLButtonElement) continue;
        ELEMENTS[section].innerHTML = "";
    }
}

function replaceBtn(btn: HTMLButtonElement, callback: () => void): HTMLButtonElement {
    const oldBtn = btn;
    if (!oldBtn.parentNode) {
        throw new Error("Old button has no parent node");
    }
    const newBtn = oldBtn.cloneNode(true) as HTMLButtonElement;
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    newBtn.addEventListener('click', callback);
    newBtn.classList.remove('hidden');
    return newBtn;
}

function display(spec: fetchDB.Spec): void {
    clear();
    const editBtn = ELEMENTS.editBtn as HTMLButtonElement;
    const cloneBtn = ELEMENTS.cloneBtn as HTMLButtonElement;
    ELEMENTS.editBtn = replaceBtn(editBtn, () => {
        const specName = encodeURIComponent(spec.name);
        window.location.href = `/nav/entry?spec=${specName}`;
    });
    ELEMENTS.cloneBtn = replaceBtn(cloneBtn, () => {
        const specName = encodeURIComponent(spec.name);
        window.location.href = `/nav/entry?spec=${specName}&clone=true`;
    });
    general(spec);
    formatting(spec);
    video(spec);
    audio(spec);
    metadata(spec);
    additional(spec);
}