import type { Signer, KeyType } from "../index.ts";

export interface SignerProvider<S extends Signer<K>, K extends KeyType, P> {
    getSigner(identifier: string, options: P): Promise<S>;
}
