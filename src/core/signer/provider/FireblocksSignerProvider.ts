import { KeyType, PublicKey, Signer } from "../index.js";
import { importKey } from "./fireblocks/fetch.js";
import { SignerProvider } from "./provider.js";

export interface FireblocksSignerOptions {
    expectedAlgorithm?: "MPC_EDDSA_ED25519" | string;
}

export class FireblocksSignerProvider<S extends Signer<K>, K extends KeyType> implements SignerProvider<S, K, FireblocksSignerOptions> {
    #apiKey: string;
    #apiSecret: string;
    #apiBaseUrl: string;

    constructor(apiKey: string, apiSecret: string, apiBaseUrl: string = "https://api.fireblocks.io") {
        this.#apiKey = apiKey;
        this.#apiSecret = apiSecret;
        this.#apiBaseUrl = apiBaseUrl;
    }

    async getSigner(_identifier: string, _options: FireblocksSignerOptions): Promise<S> {
        const secretKey = await importKey(this.#apiSecret);

        throw new Error("Method not implemented");
    }
}

class FireblocksSigner<K> implements Signer<K> {
    keyType: K;
    publicKey: PublicKey<K>;

    sign(payload: Uint8Array): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }

    verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}
