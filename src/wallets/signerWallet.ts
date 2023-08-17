import { Protocol, RawTransaction, SignedTransaction, NetworkConfig } from "../protocols";

export interface SignerWallet {
	sign<P extends Protocol>(rawTx: RawTransaction<P>, networkConfig: NetworkConfig<P>): SignedTransaction<P>;
}
