export interface Spec {
    [key: string]: any;
    source: string; //Base64 encoded string
}

export interface ClientResponse {
    type: string;
    status: string;
    error: string;
    output: {
        "clients": string[];
    }
}

export interface SpecResponse {
    type: string;
    status: string;
    error: string;
    output: {
        "specs": Spec[];
    }
}

export interface SpecNameResponse {
    type: string;
    status: string;
    error: string;
    output: {
        "specNames": string[];
    }
}


export async function fetchClients(): Promise<ClientResponse> {
    return fetch('/query/clients/client=all')
        .then((res) => res.json())
        .then((data) => { return data; });
}

export function fetchClientSpecs(client: string): Promise<SpecResponse> {
    var baseURL = '/query/specs/';
    var fullURL = baseURL + encodeURIComponent(`client=${client}`);
    return fetch(fullURL)
        .then((res) => res.json())
        .then((data) => { return data; });
}

export function fetchSpec(specID: string): Promise<SpecResponse> {
    var baseURL = '/query/specs/';
    var fullURL = baseURL + encodeURIComponent(`spec=${specID}`);
    return fetch(fullURL)
        .then((res) => res.json())
        .then((data) => { return data; });
}

export function fetchSpecNames(): Promise<SpecNameResponse> {
    return fetch('/query/specs/spec=all&namesonly=true')
        .then((res) => res.json())
        .then((data) => { return data; });
}