import { Codec } from "./Codec.js";

import { basename } from "node:path";
import { hexToBytes } from "@noble/curves/abstract/utils";

/**
 * Codec which handles reading JSON object with key `privateKey` containing hex encoded private key bytes
 */
export const JSONHexEncodedKeyCodec: Codec = {
    async loadPrivateKey(_identifier: string, buffer: Uint8Array): Promise<Uint8Array> {
        const bytes = new TextDecoder().decode(buffer);

        const parsed = JSON.parse(bytes) as { privateKey: string };
        const decoded = hexToBytes(parsed.privateKey);

        return decoded;
    },
    async determineFilename(identifier: string): Promise<string> {
        return basename(identifier + ".json");
    },
}
