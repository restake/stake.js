import { NetworkConfig, Protocol } from "../index.ts";
import { SignerWallet } from "../wallets/index.ts";

export type Signature = {
    data?: Uint8Array;
    r?: string;
    s?: string;
    v?: number;
};

export type RawTransaction<P extends Protocol> = {
    protocol: P;
    transaction: unknown;
    serialize(): string;
    getBytes(): Uint8Array;
    getHash(): string;
    getHashBytes(): Uint8Array;
}

export type SignedTransaction<P extends Protocol> = {
    protocol: P;
    transaction: unknown;
}

export interface TransactionEngine<P extends Protocol> {
    rpcUrl: URL;
    networkConfig: NetworkConfig<P>;
    sign(wallet: SignerWallet, rawTx: RawTransaction<P>, selector?: string): Promise<SignedTransaction<P>>;
    broadcast(signedTx: SignedTransaction<P>): Promise<string>;
}
