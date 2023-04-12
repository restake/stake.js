import { getAlgorithm } from "./algorithm.js";
import { encoder, isNull } from "./util.js";
import type { Algorithm } from "./algorithm.js";
import { encode as b64encode } from "../base64.js";

export async function verify(
    signature: Uint8Array,
    key: CryptoKey | null,
    alg: Algorithm,
    signingInput: string,
): Promise<boolean> {
    return isNull(key) ? signature.length === 0 : await crypto.subtle.verify(
        getAlgorithm(alg),
        key,
        signature,
        encoder.encode(signingInput),
    );
}

export async function create(
    alg: Algorithm,
    key: CryptoKey | null,
    signingInput: string,
): Promise<string> {
    return isNull(key) ? "" : b64encode(
        new Uint8Array(
            await crypto.subtle.sign(
                getAlgorithm(alg),
                key,
                encoder.encode(signingInput),
            ),
        ),
        true,
    );
}
