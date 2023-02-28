export interface Signer<P = Uint8Array, S = Uint8Array> {
    sign(payload: P): Promise<S>;

    verify(payload: P, signature: S): Promise<boolean>;
}
