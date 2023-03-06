import { Codec } from "./codec/Codec.js";
import { JSONHexEncodedKeyCodec } from "./codec/JSONHexEncodedKeyCodec.js";
import { SignerProvider } from "./provider.js";

import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

export type SignerConstructor<S> = (identifier: string, bytes: Uint8Array) => S;

export class FilesystemSignerProvider<S> implements SignerProvider<S> {
    #keyDirectory: string;
    #constructorFunc: SignerConstructor<S>;
    #codec: Codec;

    constructor(keyDirectory: string, constructorFunc: SignerConstructor<S>, codec: Codec = JSONHexEncodedKeyCodec) {
        this.#keyDirectory = keyDirectory;
        this.#constructorFunc = constructorFunc;
        this.#codec = codec;
    }

    async getSigner(identifier: string): Promise<S> {
        const filePath = join(this.#keyDirectory, basename(identifier + ".json"));

        const file = await readFile(filePath);
        const decoded = await this.#codec.loadPrivateKey(identifier, file);
        const signer = this.#constructorFunc(identifier, decoded);

        return signer;
    }
}
