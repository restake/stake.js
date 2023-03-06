import { SignerProvider } from "./provider.js";

export class FireblocksSignerProvider<S> implements SignerProvider<S> {

    constructor() {

    }

    async getSigner(identifier: string): Promise<S> {
        throw new Error("Method not implemented");
    }
}
