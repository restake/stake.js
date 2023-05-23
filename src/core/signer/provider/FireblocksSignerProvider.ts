import { KeyType, Signer } from "../index.ts";
import { SignerProvider } from "./provider.ts";

export class FireblocksSignerProvider<S extends Signer<K>, K extends KeyType> implements SignerProvider<S, K> {

    constructor() {
        // No-op
    }

    async getSigner(_identifier: string): Promise<S> {
        throw new Error("Method not implemented");
    }
}
