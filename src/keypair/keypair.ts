export interface PublicKey {
    address(): Promise<string>;
}

export interface PublicKeyContainer<P = PublicKey> {
    getPublicKey(): Promise<P>;
}

export interface PrivateKey<P = PublicKey> extends PublicKeyContainer<P> {
    
}

export interface PrivateKeyContainer<K = PrivateKey<unknown>> {
    getPrivateKey(): Promise<K>;
}

export interface KeyPair<P = PublicKey, K = PrivateKey<P>> extends PublicKeyContainer<P>, PrivateKeyContainer<K> {
    
}