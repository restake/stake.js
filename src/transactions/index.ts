import { NetworkConfig, Protocol, RawTransaction, SignedTransaction } from "../protocols";
import { SignerWallet } from "../wallets";

interface TransactionEngine<P extends Protocol> {
	rpcUrl: URL;
	networkConfig: NetworkConfig<P>;
	sign(wallet: SignerWallet, rawTx: RawTransaction<P>): SignedTransaction<P>;
	broadcast(signedTx: SignedTransaction<P>): string;
}

export abstract class BaseTransactionEngine<P extends Protocol> implements TransactionEngine<P> {
    abstract rpcUrl: URL;
    abstract networkConfig: NetworkConfig<P>;

    sign(wallet: SignerWallet, rawTx: RawTransaction<P>): SignedTransaction<P> {
        const signedTx = wallet.sign(rawTx, this.networkConfig) as SignedTransaction<P>;

        return signedTx;
    }

	abstract broadcast(signedTx: SignedTransaction<P>): string;
}
