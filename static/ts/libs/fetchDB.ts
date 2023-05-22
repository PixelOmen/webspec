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


export async function fetchClients(): Promise<ClientResponse> {
    return fetch('/query/clients/all')
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