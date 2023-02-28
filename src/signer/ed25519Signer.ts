import { bytesToHex } from "@noble/curves/abstract/utils";
import type { KeyPair, PrivateKey, PublicKey } from "../keypair/keypair.js";
import type { Signer } from "./signer.js";

import { ed25519 } from "@noble/curves/ed25519";

export class ed25519PublicKey implements PublicKey {
    // TODO
    #bytes: Uint8Array;

    constructor(bytes: Uint8Array) {
        if (bytes.length !== 16) {
            throw new Error("Expected 16 bytes");
        }

        this.#bytes = bytes;
    }

    getBytes(): Uint8Array {
        return this.#bytes;
    }

    address(): Promise<string> {
        return Promise.resolve(bytesToHex(this.#bytes));
    }
}

export class ed25519PrivateKey implements PrivateKey<ed25519PublicKey> {
    #bytes: Uint8Array;
    #publicKey: ed25519PublicKey;

    constructor(bytes: Uint8Array) {
        if (bytes.length !== 32) {
            throw new Error("Expected 32 bytes");
        }

        this.#bytes = bytes;
        this.#publicKey = new ed25519PublicKey(ed25519.getPublicKey(this.#bytes));
    }

    getPublicKey(): Promise<ed25519PublicKey> {
        return Promise.resolve(this.#publicKey);
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

    getPublicKey(): Promise<ed25519PublicKey> {
        return this.#privateKey.getPublicKey();
    }

    getPrivateKey(): Promise<ed25519PrivateKey> {
        return Promise.resolve(this.#privateKey);
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
        const publicKey = await this.#privateKey.getPublicKey();

        const result = ed25519.verify(signature, payload, publicKey.getBytes());
        return Promise.resolve(result);
    }

    async getPublicKey(): Promise<ed25519PublicKey> {
        return this.#privateKey.getPublicKey();
    }
}
