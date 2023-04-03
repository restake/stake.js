export type KeyType = string;

export interface PublicKey<K extends KeyType> {
    readonly keyType: K;
    readonly bytes: Uint8Array;
    asHex(): string;
}
