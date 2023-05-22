import type { PublicKey, Signer } from "./index.js";

import { bytesToHex } from "@noble/curves/abstract/utils";
import { ed25519 } from "@noble/curves/ed25519";

export class ed25519PublicKey implements PublicKey<"ed25519"> {
    readonly keyType = "ed25519";
    __bytes: Uint8Array;

    constructor(bytes: Uint8Array) {
        if (bytes.byteLength !== 32) {
            throw new Error("Expected 32 bytes, got " + bytes.byteLength);
        }

        this.__bytes = bytes;
    }

    get bytes(): Uint8Array {
        return this.__bytes;
    }

    asHex(): string {
        return bytesToHex(this.__bytes);
    }
}

export class ed25519PrivateKey implements Signer<"ed25519"> {
    readonly keyType = "ed25519";

    __bytes: Uint8Array;
    __publicKey: ed25519PublicKey;

    constructor(bytes: Uint8Array) {
        if (bytes.byteLength !== 32) {
            throw new Error("Expected 32 bytes");
        }

        this.__bytes = bytes;
        this.__publicKey = new ed25519PublicKey(ed25519.getPublicKey(this.__bytes));
    }

    get publicKey(): ed25519PublicKey {
        return this.__publicKey;
    }

    async sign(payload: Uint8Array): Promise<Uint8Array> {
        const result = this.signSync(payload);

        return Promise.resolve(result);
    }

    signSync(payload: Uint8Array): Uint8Array {
        return ed25519.sign(payload, this.__bytes);
    }

    async verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {
        const result = ed25519.verify(signature, payload, this.__publicKey.bytes);

        return Promise.resolve(result);
    }

    getPrivateBytes(): Uint8Array {
        return this.__bytes;
    }
}

export type ed25519Signer = Signer<"ed25519">;
