import type { Signer } from "./signer.js";

import { secp256k1 } from "@noble/curves/secp256k1";

export class secp256k1Signer implements Signer<Uint8Array> {
    async sign(payload: Uint8Array): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }

    async verify(payload: Uint8Array): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}
