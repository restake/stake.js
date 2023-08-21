import { NetworkConfig, Protocol, RawTransaction, SignedTransaction } from "../protocols/index.ts";
import { SignerWallet } from "../wallets/index.ts";

interface TransactionEngine<P extends Protocol> {
    rpcUrl: URL;
    networkConfig: NetworkConfig<P>;
    sign(wallet: SignerWallet, rawTx: RawTransaction<P>, selector?: string): Promise<SignedTransaction<P>>;
    broadcast(signedTx: SignedTransaction<P>): Promise<string>;
}

export abstract class BaseTransactionEngine<P extends Protocol> implements TransactionEngine<P> {
    abstract rpcUrl: URL;
    abstract networkConfig: NetworkConfig<P>;

    async sign(wallet: SignerWallet, rawTx: RawTransaction<P>, selector?: string): Promise<SignedTransaction<P>> {
        const signedTx = wallet.sign(rawTx, this.networkConfig, selector) as SignedTransaction<P>;

        return signedTx;
    }

    abstract broadcast(signedTx: SignedTransaction<P>): Promise<string>;
}
