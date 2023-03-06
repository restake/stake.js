import { SignerProvider } from "./provider.js";

import { hexToBytes } from "@noble/curves/abstract/utils";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

export type SignerConstructor<S> = (identifier: string, bytes: Uint8Array) => S;

export class FilesystemSignerProvider<S> implements SignerProvider<S> {
    #keyDirectory: string;
    #constructorFunc: SignerConstructor<S>

    constructor(keyDirectory: string, constructorFunc: SignerConstructor<S>) {
        this.#keyDirectory = keyDirectory;
        this.#constructorFunc = constructorFunc;
    }

    async getSigner(identifier: string): Promise<S> {
        const filePath = join(this.#keyDirectory, basename(identifier + ".json"));

        const file = await readFile(filePath, { encoding: "utf8" });
        const parsed = JSON.parse(file) as { privateKey: string };

        const decoded = hexToBytes(parsed.privateKey);
        const signer = this.#constructorFunc(identifier, decoded);

        return signer;
    }
}