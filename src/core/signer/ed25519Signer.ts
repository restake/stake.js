import type { PublicKey, Signer } from "./index.js";

import { bytesToHex } from "@noble/curves/abstract/utils";
import { ed25519 } from "@noble/curves/ed25519";

export class ed25519PublicKey implements PublicKey<"ed25519"> {
    readonly keyType = "ed25519";
    #bytes: Uint8Array;

    constructor(bytes: Uint8Array) {
        if (bytes.byteLength !== 32) {
            throw new Error("Expected 32 bytes, got " + bytes.byteLength);
        }

        this.#bytes = bytes;
    }

    get bytes(): Uint8Array {
        return this.#bytes;
    }

    asHex(): string {
        return bytesToHex(this.#bytes);
    }
}

export class ed25519PrivateKey implements Signer<"ed25519"> {
    readonly keyType = "ed25519";

    #bytes: Uint8Array;
    #publicKey: ed25519PublicKey;

    constructor(bytes: Uint8Array) {
        if (bytes.byteLength !== 32) {
            throw new Error("Expected 32 bytes");
        }

        this.#bytes = bytes;
        this.#publicKey = new ed25519PublicKey(ed25519.getPublicKey(this.#bytes));
    }

    get publicKey(): ed25519PublicKey {
        return this.#publicKey;
    }

    async sign(payload: Uint8Array): Promise<Uint8Array> {
        const result = ed25519.sign(payload, this.#bytes);
        return Promise.resolve(result);
    }

    async verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {
        const result = ed25519.verify(signature, payload, this.#publicKey.bytes);
        return Promise.resolve(result);
    }

    getPrivateBytes(): Uint8Array {
        return this.#bytes;
    }
}

export type ed25519Signer = Signer<"ed25519">;
