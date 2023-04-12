import { ed25519 } from "@noble/curves/ed25519";
import { decode as b64decode } from "../../core/utils/base64.js";
import { SignerWallet, __USING_CORE_SDK } from "../../index.js";
import { readFile } from "node:fs/promises";

export class FilesystemWallet implements SignerWallet {
    [__USING_CORE_SDK] = true;
    #filePath: string;
    #loadedKeys: ProtocolKeypair[] | undefined;

    constructor(filePath: string) {
        this.#filePath = filePath;
    }

    async loadKeys(): Promise<ProtocolKeypair[]> {
        let keys = this.#loadedKeys;
        if (keys === undefined) {
            const data = await readFile(this.#filePath, { encoding: "utf-8" });
            this.#loadedKeys = keys = JSON.parse(data) as ProtocolKeypair[];
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
        return this.findKey(protocol).then((key) => {
            let privateKeyBytes = b64decode(key.privateKey);

            // TODO
            const keyType = key.keyType ?? "ed25519";
            if (keyType !== "ed25519") {
                throw new Error(`Expected key type "${ed25519}", got "${keyType}"`);
            }

            if (protocol === "near") {
                /*
                If user converted base58 private key from ~/.near-credentials to base64 directly, then
                byte array length is 64 - first 32 bytes is private key, remaining is public key.
                */
                privateKeyBytes = privateKeyBytes.slice(0, 32);
            }

            return ed25519.sign(data, privateKeyBytes);
        });
    }

    async publicKey(protocol: string): Promise<Uint8Array> {
        return this.findKey(protocol).then((key) => {
            let privateKeyBytes = b64decode(key.privateKey);

            // TODO
            const keyType = key.keyType ?? "ed25519";
            if (keyType !== "ed25519") {
                throw new Error(`Expected key type "${ed25519}", got "${keyType}"`);
            }

            if (protocol === "near") {
                /*
                If user converted base58 private key from ~/.near-credentials to base64 directly, then
                byte array length is 64 - first 32 bytes is private key, remaining is public key.
                */
                privateKeyBytes = privateKeyBytes.slice(0, 32);
            }

            return ed25519.getPublicKey(privateKeyBytes);
        });
    }

    async accountId(protocol: string): Promise<string | null> {
        return this.findKey(protocol).then((key) => {
            return key.accountId ?? null;
        });
    }
}

type ProtocolKeypair = {
    protocol: string;
    privateKey: string;
    keyType: string | undefined;
    accountId: string | undefined | null;
};

export default FilesystemWallet;
