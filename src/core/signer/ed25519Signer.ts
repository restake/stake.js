import type { KeyPair, PrivateKey, PublicKey } from "../keypair/keypair.js";
import type { Signer } from "./signer.js";

import { bytesToHex } from "@noble/curves/abstract/utils";
import { ed25519 } from "@noble/curves/ed25519";

export class ed25519PublicKey implements PublicKey {
    // TODO
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

export class ed25519PrivateKey implements PrivateKey<ed25519PublicKey> {
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

    getPrivateBytes(): Uint8Array {
        return this.#bytes;
    }
}

export class ed25519KeyPair implements KeyPair<ed25519PublicKey, ed25519PrivateKey> {
    #privateKey: ed25519PrivateKey;

    constructor(privateKey: ed25519PrivateKey) {
        this.#privateKey = privateKey;
    }

    get publicKey(): ed25519PublicKey {
        return this.#privateKey.publicKey;
    }

    get privateKey(): ed25519PrivateKey {
        return this.#privateKey;
    }
}

export class ed25519Signer implements Signer<Uint8Array> {
    #privateKey: ed25519PrivateKey;

    constructor(privateKey: ed25519PrivateKey) {
        this.#privateKey = privateKey;
    }

    async sign(payload: Uint8Array): Promise<Uint8Array> {
        const result = ed25519.sign(payload, this.#privateKey.getPrivateBytes());
        return Promise.resolve(result);
    }

    async verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {
        const publicKey = this.#privateKey.publicKey;

        const result = ed25519.verify(signature, payload, publicKey.bytes);
        return Promise.resolve(result);
    }

    get publicKey(): ed25519PublicKey {
        return this.#privateKey.publicKey;
    }
}
