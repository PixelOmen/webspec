export { display };
const ELEMENTS = {
    container: document.getElementById('details-full-container'),
    general: document.getElementById('details-general'),
    formatting: document.getElementById('details-formatting'),
    video: document.getElementById('details-video'),
    audio: document.getElementById('details-audio'),
    metadata: document.getElementById('details-metadata'),
    additional: document.getElementById('details-additional')
};
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
function createSubItem(label) {
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
function createTextSubItem(label, value, oneLine, center, emptyOneLine) {
    const subItem = createSubItem(label);
    subItem.value.innerText = value ? value : "N/A";
    subItem.container.append(subItem.value);
    if ((oneLine && value) || (emptyOneLine && !value)) {
        subItem.container.classList.add('details-subItem-block');
    }
    if (center || !value) {
        subItem.value.style.textAlign = "center";
    }
    return subItem.container;
}
function createBoolSubItem(label, value) {
    const subItem = createSubItem(label);
    subItem.value.innerText = value ? "Required" : "N/A";
    subItem.value.style.textAlign = "center";
    return subItem.container;
}
function createIsRequiredSubItem(label, required, details, forceOneLine, center) {
    const subItem = createSubItem(label);
    if (required) {
        subItem.value.innerText = details ? details : "Required";
    }
    else {
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
    fileAnchor.href = fileURL;
    fileAnchor.innerText = filename;
    if (navigator.userAgent.indexOf("Edg") < 0 && navigator.userAgent.indexOf("Chrome") < 0) {
        fileAnchor.download = filename;
    }
    else {
        fileAnchor.target = "_blank";
    }
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
    const sectionContainer = createSection("Formatting", ELEMENTS.formatting);
    sectionContainer.append(createTextSubItem("Start Timecode", spec.start_timecode, false, true));
    sectionContainer.append(createBoolSubItem("Dropframe", spec.dropframe));
    sectionContainer.append(createTextSubItem("Naming Convention", spec.naming_convention, true));
    sectionContainer.append(createTextSubItem("Head/Tail", spec.headtailbuild, true));
    sectionContainer.append(createIsRequiredSubItem("Slate", spec.slate_required, spec.slate_details, true));
    sectionContainer.append(createIsRequiredSubItem("Burn-ins", spec.burnins_required, spec.burnins_details, true));
    sectionContainer.append(createIsRequiredSubItem("Forensic", spec.watermark_required, spec.watermark_details, true));
    sectionContainer.append(createIsRequiredSubItem("Subtitles/Captions", spec.subcap_required, spec.subcap_details, true));
    sectionContainer.append(createIsRequiredSubItem("Act/Commercial Breaks", spec.act_breaks_required, spec.act_breaks_details, true));
}
function video(spec) {
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
function audio(spec) {
    const sectionContainer = createSection("Audio", ELEMENTS.audio);
    sectionContainer.append(createTextSubItem("Codec", spec.audio_codec, false, true));
    sectionContainer.append(createTextSubItem("Profile", spec.audio_codec_profile, false, true));
    sectionContainer.append(createTextSubItem("Bitrate", spec.audio_bitrate, false, true));
    sectionContainer.append(createTextSubItem("Bitdepth", spec.audio_bitdepth, false, true));
    sectionContainer.append(createBoolSubItem("LKFS", spec.lkfs));
    sectionContainer.append(createIsRequiredSubItem("Audio Description (AD)", spec.audio_description_required, spec.audio_description_details, true));
    sectionContainer.append(createTextSubItem("Audio Config", spec.audio_config, true));
    sectionContainer.append(createTextSubItem("Audio Details", spec.audio_details));
}
function metadata(spec) {
    const sectionContainer = createSection("Metadata", ELEMENTS.metadata);
    sectionContainer.append(createBoolSubItem("QT Audio Flags", spec.audio_flags));
    sectionContainer.append(createBoolSubItem("V-chip", spec.vchip));
    sectionContainer.append(createBoolSubItem("AFD", spec.afd));
    sectionContainer.append(createIsRequiredSubItem("HDR Metadata", spec.hdr_metadata_required, spec.hdr_metadata_details, true));
    sectionContainer.append(createIsRequiredSubItem("Streaming Flags", spec.streaming_flags_required, spec.streaming_flags_details, true));
}
function additional(spec) {
    const sectionContainer = createSection("Additional", ELEMENTS.additional);
    sectionContainer.append(createIsRequiredSubItem("Artwork", spec.artwork_required, spec.artwork_details, true));
    sectionContainer.append(createIsRequiredSubItem("Reports/Forms", spec.reports_required, spec.reports_details, true));
    sectionContainer.append(createTextSubItem("Notes", spec.notes, true));
}
function clear() {
    for (const section in ELEMENTS) {
        if (ELEMENTS[section] == ELEMENTS.container)
            continue;
        ELEMENTS[section].innerHTML = "";
    }
}
function display(spec) {
    clear();
    general(spec);
    formatting(spec);
    video(spec);
    audio(spec);
    metadata(spec);
    additional(spec);
}
