import type { KeyPair, PrivateKey, PublicKey } from "../keypair/keypair.js";
import type { Signer } from "./signer.js";

import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils";
import { secp256k1, schnorr } from "@noble/curves/secp256k1";
import type { SignOpts } from "@noble/curves/abstract/weierstrass";
import { decompressSecp256k1PublicKey } from "../utils/secp256k1.js";

export class secp256k1PublicKey implements PublicKey {
    // TODO
    #bytes: Uint8Array;
    #compressedBytes: Uint8Array;

    // This constructor only accepts 33-byte long compressed public key
    constructor(
        compressedBytes: Uint8Array,
    ) {
        if (compressedBytes.byteLength !== 33) {
            throw new Error("Expected 33 bytes, got " + compressedBytes.byteLength);
        }

        this.#bytes = hexToBytes(decompressSecp256k1PublicKey(bytesToHex(compressedBytes)));
        this.#compressedBytes = compressedBytes;
    }

    /**
     * Gets secp256k1 uncompressed public key bytes
     *
     * @returns secp256k1 uncompressed public key bytes
     */
    get bytes(): Uint8Array {
        return this.#bytes;
    }

    /**
     * Gets secp256k1 compressed public key bytes
     *
     * @returns secp256k1 compressed public key bytes
     */
    get compressedBytes(): Uint8Array {
        return this.#compressedBytes;
    }

    asHex(): string {
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
        this.#publicKey = new secp256k1PublicKey(
            secp256k1.getPublicKey(this.#bytes, true),
        );
    }

    get publicKey(): secp256k1PublicKey {
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

    get publicKey(): secp256k1PublicKey {
        return this.#privateKey.publicKey;
    }

    get privateKey(): secp256k1PrivateKey {
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
        const publicKey = this.#privateKey.publicKey;

        const result = secp256k1.verify(signature, payload, publicKey.bytes);
        return Promise.resolve(result);
    }

    get publicKey(): secp256k1PublicKey {
        return this.#privateKey.publicKey;
    }
}
