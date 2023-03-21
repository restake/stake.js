import type { KeyPair, PrivateKey, PublicKey } from "../keypair/keypair.js";
import type { Signer } from "./signer.js";

import { bytesToHex } from "@noble/curves/abstract/utils";
import { secp256k1, schnorr } from "@noble/curves/secp256k1";
import type { SignOpts } from "@noble/curves/abstract/weierstrass";

export class secp256k1PublicKey implements PublicKey {
    // TODO
    #bytes: Uint8Array;

    constructor(bytes: Uint8Array) {
        if (bytes.byteLength !== 33) {
            throw new Error("Expected 33 bytes, got " + bytes.byteLength);
        }

        this.#bytes = bytes;
    }

    getBytes(): Uint8Array {
        return this.#bytes;
    }

    address(): string {
        return bytesToHex(this.#bytes);
    }
}

export class secp256k1PrivateKey implements PrivateKey<secp256k1PublicKey> {
    #bytes: Uint8Array;
    #publicKey: secp256k1PublicKey;

    constructor(bytes: Uint8Array) {
        if (bytes.byteLength !== 32) {
            throw new Error("Expected 32 bytes, got " + bytes.byteLength);
        }

        this.#bytes = bytes;
        this.#publicKey = new secp256k1PublicKey(secp256k1.getPublicKey(this.#bytes));
    }

    getPublicKey(): secp256k1PublicKey {
        return this.#publicKey;
    }

    getPrivateBytes(): Uint8Array {
        return this.#bytes;
    }
}

export class secp256k1KeyPair implements KeyPair<secp256k1PublicKey, secp256k1PrivateKey> {
    #privateKey: secp256k1PrivateKey;

    constructor(privateKey: secp256k1PrivateKey) {
        this.#privateKey = privateKey;
    }

    getPublicKey(): secp256k1PublicKey {
        return this.#privateKey.getPublicKey();
    }

    getPrivateKey(): secp256k1PrivateKey {
        return this.#privateKey;
    }
}

export class secp256k1Signer implements Signer<Uint8Array> {
    #privateKey: secp256k1PrivateKey;

    constructor(privateKey: secp256k1PrivateKey) {
        this.#privateKey = privateKey;
    }

    async sign(payload: Uint8Array): Promise<Uint8Array> {
        const result = schnorr.sign(payload, this.#privateKey.getPrivateBytes());
        return Promise.resolve(result);
    }

    async edSign(payload: Uint8Array, opts?: SignOpts): Promise<{ r: bigint, s: bigint, recovery?: number }> {
        return secp256k1.sign(payload, this.#privateKey.getPrivateBytes(), opts);
    }

    async verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {
        const publicKey = await this.#privateKey.getPublicKey();

        const result = secp256k1.verify(signature, payload, publicKey.getBytes());
        return Promise.resolve(result);
    }

    getPublicKey(): secp256k1PublicKey {
        return this.#privateKey.getPublicKey();
    }

    // TODO: Remove
    getPrivateBytes(): Uint8Array {
        return this.#privateKey.getPrivateBytes();
    }
}
