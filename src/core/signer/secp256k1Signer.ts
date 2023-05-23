import type { PublicKey, Signer } from "./index.ts";

import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils";
import { secp256k1, schnorr } from "@noble/curves/secp256k1";
import type { SignOpts } from "@noble/curves/abstract/weierstrass";
import { decompressSecp256k1PublicKey } from "../utils/secp256k1.ts";

export class secp256k1PublicKey implements PublicKey<"secp256k1"> {
    static COMPRESSED_PUBLIC_KEY_SIZE = 33;
    static UNCOMPRESSED_PUBLIC_KEY_SIZE = 65;

    readonly keyType = "secp256k1";
    __bytes: Uint8Array;

    // This constructor only accepts 33-byte long compressed public key
    constructor(
        compressedBytes: Uint8Array,
    ) {
        if (compressedBytes.byteLength !== secp256k1PublicKey.COMPRESSED_PUBLIC_KEY_SIZE) {
            throw new Error(`Expected ${secp256k1PublicKey.COMPRESSED_PUBLIC_KEY_SIZE} bytes, got ${compressedBytes.byteLength}`);
        }

        this.__bytes = compressedBytes;
    }

    /**
     * Gets secp256k1 compressed public key bytes
     *
     * @returns secp256k1 compressed public key bytes
     */
    get bytes(): Uint8Array {
        return this.__bytes;
    }

    /**
     * Gets secp256k1 uncompressed public key bytes
     *
     * @returns secp256k1 uncompressed public key bytes
     */
    get uncompressedBytes(): Uint8Array {
        return hexToBytes(decompressSecp256k1PublicKey(this.asHex()));
    }

    asHex(): string {
        return bytesToHex(this.__bytes);
    }
}

export class secp256k1PrivateKey implements Signer<"secp256k1"> {
    static PRIVATE_KEY_SIZE = 32;

    readonly keyType = "secp256k1";
    __bytes: Uint8Array;
    __publicKey: secp256k1PublicKey;

    constructor(bytes: Uint8Array) {
        if (bytes.byteLength !== secp256k1PrivateKey.PRIVATE_KEY_SIZE) {
            throw new Error(`Expected ${secp256k1PrivateKey.PRIVATE_KEY_SIZE} bytes, got ${bytes.byteLength}`);
        }

        this.__bytes = bytes;
        this.__publicKey = new secp256k1PublicKey(
            secp256k1.getPublicKey(this.__bytes, true),
        );
    }

    async sign(payload: Uint8Array): Promise<Uint8Array> {
        const result = this.signSync(payload);

        return Promise.resolve(result);
    }

    signSync(payload: Uint8Array): Uint8Array {
        return schnorr.sign(payload, this.__bytes);
    }

    async edSign(payload: Uint8Array, opts?: SignOpts): Promise<ECDSASignature> {
        const result = this.edSignSync(payload, opts);

        return Promise.resolve(result);
    }

    edSignSync(payload: Uint8Array, opts?: SignOpts): ECDSASignature {
        return secp256k1.sign(payload, this.__bytes, opts);
    }

    async verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {
        const result = secp256k1.verify(signature, payload, this.__publicKey.bytes);

        return Promise.resolve(result);
    }

    get publicKey(): secp256k1PublicKey {
        return this.__publicKey;
    }

    getPrivateBytes(): Uint8Array {
        return this.__bytes;
    }
}

export type ECDSASignature = { r: bigint, s: bigint, recovery?: number };

export type secp256k1Signer = Signer<"secp256k1"> & {
    edSign(payload: Uint8Array, opts?: SignOpts): Promise<ECDSASignature>;
    edSignSync(payload: Uint8Array, opts?: SignOpts): ECDSASignature;
};
