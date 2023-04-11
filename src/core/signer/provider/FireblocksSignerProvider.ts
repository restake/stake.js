import { KeyType, Signer } from "../index.js";
import { SignerProvider } from "./provider.js";

export class FireblocksSignerProvider<S extends Signer<K>, K extends KeyType> implements SignerProvider<S, K> {

    constructor() {
        // No-op
    }

    async getSigner(_identifier: string): Promise<S> {
        throw new Error("Method not implemented");
    }
}
