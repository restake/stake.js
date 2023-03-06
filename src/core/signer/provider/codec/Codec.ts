/**
 * Interface to obtain a private key from the buffer
 */
export interface Codec {
    /**
     * Loads private key from buffer
     *
     * @param identifier Identifier used to request the key
     * @param buffer Raw data provided by signer provider
     */
    loadPrivateKey(identifier: string, buffer: Uint8Array): Promise<Uint8Array>;

    /**
     * Determines file name from identifier
     *
     * @param identifier Identifier used to request the key
     */
    determineFilename(identifier: string): Promise<string>;
}
