/*
export class HTTPError implements Error {
    name: string;
    message: string;
    stack?: string | undefined;
    cause?: unknown;
}
*/

export type JSONRPCRequest = {
    jsonrpc: string;
    id: string | number;
    method: string;
    params: unknown;
};

export type JSONRPCResponse<T, E> = {
    jsonrpc: string;
    id: string | number;
    result?: T;
    error?: E;
};

export async function jsonrpc<T>(endpoint: URL | string, method: string, params: unknown): Promise<T> {
    const body: JSONRPCRequest = {
        jsonrpc: "2.0",
        id: "123",
        method,
        params,
    };

    const request = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    // TODO: brittle
    const contentType = request.headers.get("Content-Type");
    if (!contentType?.toLowerCase()?.startsWith("application/json")) {
        // throw new HTTPError();
    }

    const responseBody = await request.json() as JSONRPCResponse<T, string>;
    if (request.status !== 200) {
        // throw new HTTPError();
    }

    // TODO: proper error handling
    const { error, result } = responseBody;
    if (error) {
        console.log(error);
        throw new Error(error);
    }

    if (!result) {
        // XXX: if result is not present, then remote is not following JSON-RPC specification
        throw new Error("No result");
    }
    return result;
}
