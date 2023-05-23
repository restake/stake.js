import type { Signer, KeyType } from "../index.ts";

export interface SignerProvider<S extends Signer<K>, K extends KeyType> {
    getSigner(identifier: string): Promise<S>;
}
