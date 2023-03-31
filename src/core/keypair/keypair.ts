export interface PublicKey {
    asHex(): string;
}

export interface PublicKeyContainer<P = PublicKey> {
    readonly publicKey: P;
}

export interface PrivateKey<P = PublicKey> extends PublicKeyContainer<P> {

}

export interface PrivateKeyContainer<K = PrivateKey<unknown>> {
    readonly privateKey: K;
}

export interface KeyPair<P = PublicKey, K = PrivateKey<P>> extends PublicKeyContainer<P>, PrivateKeyContainer<K> {

}
