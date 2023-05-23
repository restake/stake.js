import { KeyType, PublicKey } from "./index.ts";

export interface Signer<K extends KeyType> {
    readonly keyType: K;
    readonly publicKey: PublicKey<K>;

    /**
     * Signs provided payload
     *
     * @param payload Data to sign
     * @returns Signature
     */
    sign(payload: Uint8Array): Promise<Uint8Array>;

    /**
     * Signs provided payload synchronously. If synchronous signing is not supported,
     * then this method throws an error
     *
     * @param payload Data to sign
     * @returns Signature
     */
    signSync(payload: Uint8Array): Uint8Array;

    /**
     * Verifies whether signature is valid
     *
     * @param payload Payload with a signature
     * @param signature Signature to verify
     * @returns Boolean
     */
    verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean>;
}
