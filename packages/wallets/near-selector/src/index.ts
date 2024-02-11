import { NetworkConfig, Signature, SignerWallet, RawTransaction, Protocol, PROTOCOL, NearProtocol } from "@restake/stake.js-core";
import { WalletSelector } from "@near-wallet-selector/core";

export class NearSelectorWallet implements SignerWallet {
    walletSelector;

    constructor(walletSelector: WalletSelector) {
        this.walletSelector = walletSelector;
    }

    async getAddress<P extends Protocol>(networkConfig: NetworkConfig<P>, selector?: string): Promise<string> {
        if (networkConfig.protocol !== PROTOCOL.NEAR_PROTOCOL) {
            throw new Error("NearSelectorWallet only supports Near Protocol.");
        }

        const accounts = await this.walletSelector.wallet.getAccounts();
        const account = accounts.find((account: { accountId: string }) => account.accountId === selector);

        return account.accountId || account.publicKey;
    }

    async getPublicKey<P extends Protocol>(networkConfig: NetworkConfig<P>, selector?: string): Promise<string> {
        if (networkConfig.protocol !== PROTOCOL.NEAR_PROTOCOL) {
            throw new Error("NearSelectorWallet only supports Near Protocol.");
        }

        const accounts = await this.walletSelector.wallet.getAccounts();
        const account = accounts.find((account: { accountId: string }) => account.accountId === selector);

        return account.publicKey;
    }

    async sign(): Promise<Signature> {
        throw new Error("Cannot do raw signing with NearSelectorWallet.");
    }

    async signAndBroadcast(
        rawTx: RawTransaction<NearProtocol>,
    ): Promise<void> {
        this.walletSelector.wallet.signAndSendTransactions({ transactions: [rawTx] });
    }
}
