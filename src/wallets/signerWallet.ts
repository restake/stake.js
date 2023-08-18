import { Protocol, RawTransaction, SignedTransaction, NetworkConfig } from "../protocols";

export interface SignerWallet {
    getAddress<P extends Protocol>(networkConfig: NetworkConfig<P>): string;
	sign<P extends Protocol>(rawTx: RawTransaction<P>, networkConfig: NetworkConfig<P>): SignedTransaction<P>;
}
