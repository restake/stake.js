export interface Signer<P = Uint8Array, S = Uint8Array> {
    /**
     * Signs provided payload
     *
     * @param payload Data to sign
     * @returns Signature
     */
    sign(payload: P): Promise<S>;

    /**
     * Verifies whether signature is valid
     *
     * @param payload Payload with a signature
     * @param signature Signature to verify
     * @returns Boolean
     */
    verify(payload: P, signature: S): Promise<boolean>;
}
