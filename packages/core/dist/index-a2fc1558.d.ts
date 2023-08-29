import { Protocol, NetworkConfig } from './protocols/types.cjs';

interface SignerWallet {
    getPublicKey<P extends Protocol>(networkConfig: NetworkConfig<P>, selector?: string): Promise<string> | string;
    getAddress<P extends Protocol>(networkConfig: NetworkConfig<P>, selector?: string): Promise<string> | string;
    sign<P extends Protocol>(rawTx: RawTransaction<P>, networkConfig: NetworkConfig<P>, selector?: string): Promise<Signature> | Signature;
}

type Signature = {
    data?: Uint8Array;
    r?: string;
    s?: string;
    v?: number;
};
type RawTransaction<P extends Protocol> = {
    protocol: P;
    transaction: unknown;
    serialize(): string;
    getBytes(): Uint8Array;
    getHash(): string;
    getHashBytes(): Uint8Array;
};
type SignedTransaction<P extends Protocol> = {
    protocol: P;
    transaction: unknown;
};
interface TransactionEngine<P extends Protocol> {
    rpcUrl: URL;
    networkConfig: NetworkConfig<P>;
    sign(wallet: SignerWallet, rawTx: RawTransaction<P>, selector?: string): Promise<SignedTransaction<P>>;
    broadcast(signedTx: SignedTransaction<P>): Promise<string>;
}

export { RawTransaction as R, Signature as S, TransactionEngine as T, SignedTransaction as a, SignerWallet as b };
