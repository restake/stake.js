import { Codec } from "./codec/Codec.js";
import { JSONHexEncodedKeyCodec } from "./codec/JSONHexEncodedKeyCodec.js";
import { SignerProvider } from "./provider.js";
import { KeyType, Signer } from "../index.js";

import { join } from "node:path";
import { readFile } from "node:fs/promises";

/**
 * Function type for constructing a signer from private key bytes
 *
 * @type K The signer type
 */
export type SignerConstructor<S extends Signer<K>, K extends KeyType> = (identifier: string, bytes: Uint8Array) => S;

/**
 * FilesystemSignerProvider constructs signer from private key loaded from filesystem
 *
 * @type K The signer type
 */
export class FilesystemSignerProvider<S extends Signer<K>, K extends KeyType> implements SignerProvider<S, K> {
    __keyDirectory: string;
    __constructorFunc: SignerConstructor<S, K>;
    __codec: Codec;

    /**
     * Constructs a new instance of FilesystemSignerProvider
     *
     * @param keyDirectory Directory where key files are loaded from
     * @param constructorFunc Function which constructs <S> from raw bytes
     * @param codec Codec which turns file bytes into private key bytes. Defaults to `JSONHexEncodedKeyCodec`
     */
    constructor(keyDirectory: string, constructorFunc: SignerConstructor<S, K>, codec: Codec = JSONHexEncodedKeyCodec) {
        this.__keyDirectory = keyDirectory;
        this.__constructorFunc = constructorFunc;
        this.__codec = codec;
    }

    async getSigner(identifier: string): Promise<S> {
        const fileName = await this.__codec.determineFilename(identifier);
        const filePath = join(this.__keyDirectory, fileName);

        const file = await readFile(filePath);
        const decoded = await this.__codec.loadPrivateKey(identifier, file);
        const signer = this.__constructorFunc(identifier, decoded);

        return signer;
    }
}
