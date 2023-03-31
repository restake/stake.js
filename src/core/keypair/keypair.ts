export interface PublicKey {
    asHex(): string;
}

export interface PublicKeyContainer<P = PublicKey> {
    getPublicKey(): P;
}

export interface PrivateKey<P = PublicKey> extends PublicKeyContainer<P> {

}

export interface PrivateKeyContainer<K = PrivateKey<unknown>> {
    getPrivateKey(): K;
}

export interface KeyPair<P = PublicKey, K = PrivateKey<P>> extends PublicKeyContainer<P>, PrivateKeyContainer<K> {

}
