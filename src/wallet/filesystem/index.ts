import { decode as b64decode } from "../../core/utils/base64.ts";
import { SignerWallet, __USING_CORE_SDK } from "../../index.ts";
import { Signer } from "../../core/signer/signer.ts";
import { ed25519PrivateKey } from "../../core/signer/ed25519Signer.ts";
import { secp256k1PrivateKey } from "../../core/signer/index.ts";

import { readFile } from "node:fs/promises";

export class FilesystemWallet implements SignerWallet {
    [__USING_CORE_SDK] = true;
    __filePath: string;
    __loadedKeys: ProtocolKeypair[] | undefined;

    constructor(filePath: string) {
        this.__filePath = filePath;
    }

    async loadKeys(): Promise<ProtocolKeypair[]> {
        let keys = this.__loadedKeys;
        if (keys === undefined) {
            const data = await readFile(this.__filePath, { encoding: "utf-8" });
            this.__loadedKeys = keys = JSON.parse(data) as ProtocolKeypair[];
        }

        return keys;
    }

    async findKey(protocol: string): Promise<ProtocolKeypair> {
        const keys = await this.loadKeys();
        const foundKey = keys.find((key) => key.protocol === protocol);
        if (!foundKey) {
            throw new Error(`No keypair for protocol "${protocol}"`);
        }

        return foundKey;
    }

    async sign(protocol: string, data: Uint8Array): Promise<Uint8Array> {
        return this.findKey(protocol).then(async (key) => {
            let privateKeyBytes = b64decode(key.privateKey);
            if (protocol === "near") {
                /*
                If user converted base58 private key from ~/.near-credentials to base64 directly, then
                byte array length is 64 - first 32 bytes is private key, remaining is public key.
                */
                privateKeyBytes = privateKeyBytes.slice(0, 32);
            }

            const signer = await this.constructCoreSigner(key.keyType, privateKeyBytes);

            return signer.sign(data);
        });
    }

    async publicKey(protocol: string): Promise<Uint8Array> {
        return this.findKey(protocol).then(async (key) => {
            let privateKeyBytes = b64decode(key.privateKey);
            if (protocol === "near") {
                /*
                If user converted base58 private key from ~/.near-credentials to base64 directly, then
                byte array length is 64 - first 32 bytes is private key, remaining is public key.
                */
                privateKeyBytes = privateKeyBytes.slice(0, 32);
            }

            const signer = await this.constructCoreSigner(key.keyType, privateKeyBytes);

            return signer.publicKey.bytes;
        });
    }

    async accountId(protocol: string): Promise<string | null> {
        return this.findKey(protocol).then((key) => {
            return key.accountId ?? null;
        });
    }

    async keyType(protocol: string): Promise<string> {
        const keyType = await this.findKey(protocol).then((key) => {
            return key.keyType;
        });

        if (!keyType) {
            throw new Error(`No key available for protocol "${protocol}"`);
        }

        return keyType;
    }

    private async constructCoreSigner<K extends string>(keyType: K, privateKeyBytes: Uint8Array): Promise<Signer<K>> {
        if (keyType === "ed25519") {
            return new ed25519PrivateKey(privateKeyBytes) as unknown as Signer<K>;
        } else if (keyType === "secp256k1") {
            return new secp256k1PrivateKey(privateKeyBytes) as unknown as Signer<K>;
        } else {
            throw new Error(`Unsupported key type '${keyType}'`);
        }
    }
}

type ProtocolKeypair = {
    protocol: string;
    privateKey: string;
    keyType: string;
    accountId: string | undefined | null;
};

export default FilesystemWallet;
