export { Spec, display };

const ELEMENTS: { [key: string]: HTMLDivElement } = {
    container: document.getElementById('details-full-container') as HTMLDivElement,
    general: document.getElementById('details-general') as HTMLDivElement,
    formatting: document.getElementById('details-formatting') as HTMLDivElement,
    video: document.getElementById('details-video') as HTMLDivElement,
    audio: document.getElementById('details-audio') as HTMLDivElement,
    subcap: document.getElementById('details-subcap') as HTMLDivElement,
    metadata: document.getElementById('details-metadata') as HTMLDivElement,
    additional: document.getElementById('details-additional') as HTMLDivElement
}

interface Spec {
    [key: string]: any;
    source: string; //Base64 encoded string
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

function createTextSubItem(label: string, value: string, forceOneLine?: boolean,
                                                            center?: boolean): HTMLDivElement {
    const subItem = createSubItem(label);
    subItem.value.innerText = value ? value : "N/A";
    subItem.container.append(subItem.value);
    if (forceOneLine && value) {
        subItem.container.classList.add('details-subItem-block');
    }
    if (center || !value) {
        subItem.value.style.textAlign = "center";
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

function base64ToURL(b64str: string, apptype?: string): string {
    const apptypeStr = apptype ? apptype : 'application/pdf';
    const binaryData = base64ToBinary(b64str);
    const url = URL.createObjectURL(new Blob([binaryData], { type: apptypeStr }));
    return url;
}

function createFileSubItem(label: string, filename: string, base64str: string,
                                                            oneline?: boolean): HTMLDivElement {
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
    fileAnchor.href = fileURL;
    fileAnchor.innerText = filename;
    if (navigator.userAgent.indexOf("Edg") < 0 && navigator.userAgent.indexOf("Chrome") < 0) {
        fileAnchor.download = filename;
    } else {
        fileAnchor.target = "_blank";
    }
    subItemContainer.append(fileAnchor);
    if (oneline) {
        subItemContainer.classList.add('details-subItem-block');
    }
    return subItemContainer;
}


function general(spec: Spec): void {
    const sectionContainer = createSection("General", ELEMENTS.general);
    sectionContainer.append(createTextSubItem("Client", spec.client_name));
    sectionContainer.append(createTextSubItem("Spec", spec.name));
    sectionContainer.append(createTextSubItem("Created", spec.created));
    sectionContainer.append(createTextSubItem("Updated", spec.updated));
    sectionContainer.append(createFileSubItem("Source", spec.source_filename, spec.source));
    sectionContainer.append(createTextSubItem("Description", spec.description, true));
}

function formatting(spec: Spec): void {
    const sectionContainer = createSection("Formatting", ELEMENTS.formatting);
    sectionContainer.append(createTextSubItem("Start Timecode", spec.start_timecode, false, true));
    sectionContainer.append(createIsRequiredSubItem("Act/Commercial Breaks", spec.act_breaks_required,
                                                                                spec.act_breaks_details, true));
    sectionContainer.append(createTextSubItem("Naming Convention", spec.naming_convention, true));
    sectionContainer.append(createTextSubItem("Head/Tail", spec.headtailbuild, true));
    sectionContainer.append(createIsRequiredSubItem("Slate", spec.slate_required, spec.slate_details, true));
    sectionContainer.append(createIsRequiredSubItem("Burn-ins", spec.burnins_required, spec.burnins_details, true));
}

function video(spec: Spec): void {
    const sectionContainer = createSection("Video", ELEMENTS.video);
    sectionContainer.append(createTextSubItem("Resolution", spec.resolution, false, true));
    sectionContainer.append(createTextSubItem("Aspect Ratio", spec.aspect_ratio, false, true));
    sectionContainer.append(createTextSubItem("Framerate", spec.framerate, false, true));
    sectionContainer.append(createTextSubItem("Codec", spec.video_codec, false, true));
    sectionContainer.append(createTextSubItem("Profile", spec.video_codec_profile, false, true));
    sectionContainer.append(createTextSubItem("Bitrate", spec.video_bitrate, false, true));
    sectionContainer.append(createTextSubItem("Bitdepth", spec.video_bitdepth, false, true));
    sectionContainer.append(createTextSubItem("Colorspace", spec.colorspace, false, true));
}

function audio(spec: Spec): void {
    const sectionContainer = createSection("Audio", ELEMENTS.audio);
    sectionContainer.append(createTextSubItem("Codec", spec.audio_codec, false, true));
    sectionContainer.append(createTextSubItem("Profile", spec.audio_codec_profile, false, true));
    sectionContainer.append(createTextSubItem("Bitrate", spec.audio_bitrate, false, true));
    sectionContainer.append(createTextSubItem("Bitdepth", spec.audio_bitdepth, false, true));
    sectionContainer.append(createTextSubItem("Audio Config", spec.audio_config, true));
    sectionContainer.append(createTextSubItem("Audio Details", spec.audio_details));
    sectionContainer.append(createIsRequiredSubItem("Audio Description", spec.audio_description_required,
                                                                        spec.audio_description_details, true));
}

function subcap(spec: Spec): void {
    const sectionContainer = createSection("Subtitles / Captions", ELEMENTS.subcap);
}


function clear(): void {
    for (const section in ELEMENTS) {
        if (ELEMENTS[section] == ELEMENTS.container) continue;
        ELEMENTS[section].innerHTML = "";
    }
}

function display(spec: Spec): void {
    clear();
    general(spec);
    formatting(spec);
    video(spec);
    audio(spec);
    subcap(spec);
}