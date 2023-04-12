import { ZodType, z } from "zod";
import { bytesToHex } from "@noble/hashes/utils";
import { sha256 } from "@noble/hashes/sha256";

import { zodFetch } from "../../../utils/http.js";
import { decode as b64decode } from "../../../utils/base64.js";
import { create as createJWT } from "../../../utils/djwt/index.js";

import { webcrypto as crypto } from "node:crypto";

export async function importKey(apiSecretPEM: string): Promise<CryptoKey> {
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";

    const der = b64decode(apiSecretPEM.replace(pemHeader, "").replace(pemFooter, ""));

    return await crypto.subtle.importKey(
        "pkcs8",
        der,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"],
    );
}

async function computeJWT(
    apiKey: string,
    apiSecret: CryptoKey,
    url: URL,
    serializedBody: string | undefined,
): Promise<string> {
    const encodedBody = new TextEncoder().encode(serializedBody ?? "\"\"");
    const nonce = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const claims = {
        uri: url.pathname + url.search,
        nonce,
        iat: now,
        exp: now + 29,
        sub: apiKey,
        bodyHash: bytesToHex(sha256(encodedBody)),
    };

    return createJWT({ alg: "RS256", typ: "JWT" }, claims, apiSecret);
}

export async function fireblocksAPI<T extends ZodType, R extends z.infer<T>>(
    validator: T,
    apiKey: string,
    apiSecret: CryptoKey,
    apiBase: string,
    method: string,
    endpoint: string,
    body?: unknown,
): Promise<R> {
    const url = new URL(endpoint, apiBase);

    const serializedBody = method !== "GET" && method !== "DELETE" ? JSON.stringify(body) : undefined;
    const jwt = await computeJWT(apiKey, apiSecret, url, serializedBody);
    const headers = new Headers({
        "Authorization": `Bearer ${jwt}`,
        "X-API-Key": apiKey,
        "User-Agent": "Restake-stake.js/0.0.0-dev",
    });

    if (serializedBody !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    const response = await zodFetch(validator, url, {
        method,
        headers,
        body: serializedBody,
    });

    return response;
}
