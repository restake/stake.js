import { Codec } from "./Codec.ts";

import { basename } from "node:path";
import { decode as b64decode } from "../../../utils/base64.ts";

/**
 * Codec which handles reading JSON object with key `privateKey` containing base64 encoded private key bytes
 */
export const JSONBase64EncodedKeyCodec: Codec = {
    async loadPrivateKey(_identifier: string, buffer: Uint8Array): Promise<Uint8Array> {
        const bytes = new TextDecoder().decode(buffer);

        const parsed = JSON.parse(bytes) as { privateKey: string };
        const decoded = b64decode(parsed.privateKey);

        return decoded;
    },
    async determineFilename(identifier: string): Promise<string> {
        return basename(identifier + ".json");
    },
};
