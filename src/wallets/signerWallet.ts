import { Protocol, RawTransaction, SignedTransaction, NetworkConfig } from "../protocols/index.ts";

export interface SignerWallet {
    getAddress<P extends Protocol>(networkConfig: NetworkConfig<P>, accountId?: string): Promise<string> | string;
    sign<P extends Protocol>(
        rawTx: RawTransaction<P>,
        networkConfig: NetworkConfig<P>,
        accountId?: string
    ): Promise<SignedTransaction<P>> | SignedTransaction<P>;
}
