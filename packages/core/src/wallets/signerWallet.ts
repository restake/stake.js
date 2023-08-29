import { NetworkConfig, Protocol } from "../protocols/index.ts";
import { RawTransaction, Signature } from "../transactions/index.ts";

export interface SignerWallet {
    getPublicKey<P extends Protocol>(networkConfig: NetworkConfig<P>, selector?: string): Promise<string> | string;
    getAddress<P extends Protocol>(networkConfig: NetworkConfig<P>, selector?: string): Promise<string> | string;
    sign<P extends Protocol>(
        rawTx: RawTransaction<P>,
        networkConfig: NetworkConfig<P>,
        selector?: string
    ): Promise<Signature> | Signature;
}
