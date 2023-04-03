import type { PublicKey, Signer } from "./index.js";

import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils";
import { secp256k1, schnorr } from "@noble/curves/secp256k1";
import type { SignOpts } from "@noble/curves/abstract/weierstrass";
import { decompressSecp256k1PublicKey } from "../utils/secp256k1.js";

export class secp256k1PublicKey implements PublicKey<"secp256k1"> {
    readonly keyType = "secp256k1";
    #bytes: Uint8Array;

    // This constructor only accepts 33-byte long compressed public key
    constructor(
        compressedBytes: Uint8Array,
    ) {
        if (compressedBytes.byteLength !== 33) {
            throw new Error("Expected 33 bytes, got " + compressedBytes.byteLength);
        }

        this.#bytes = compressedBytes;
    }

    /**
     * Gets secp256k1 compressed public key bytes
     *
     * @returns secp256k1 compressed public key bytes
     */
    get bytes(): Uint8Array {
        return this.#bytes;
    }

    /**
     * Gets secp256k1 uncompressed public key bytes
     *
     * @returns secp256k1 uncompressed public key bytes
     */
    get uncompressedBytes(): Uint8Array {
        return hexToBytes(decompressSecp256k1PublicKey(this.asHex()))
    }

    asHex(): string {
        return bytesToHex(this.#bytes);
    }
}

export class secp256k1PrivateKey implements Signer<"secp256k1"> {
    readonly keyType = "secp256k1";
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

    async sign(payload: Uint8Array): Promise<Uint8Array> {
        const result = schnorr.sign(payload, this.#bytes);
        return Promise.resolve(result);
    }

    async edSign(payload: Uint8Array, opts?: SignOpts): Promise<{ r: bigint, s: bigint, recovery?: number }> {
        return secp256k1.sign(payload, this.#bytes, opts);
    }

    async verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {
        const result = secp256k1.verify(signature, payload, this.#publicKey.bytes);
        return Promise.resolve(result);
    }

    get publicKey(): secp256k1PublicKey {
        return this.#publicKey;
    }

    getPrivateBytes(): Uint8Array {
        return this.#bytes;
    }
}

export type secp256k1Signer = Signer<"secp256k1"> & {
    edSign(payload: Uint8Array, opts?: SignOpts): Promise<{ r: bigint, s: bigint, recovery?: number }>;
};
