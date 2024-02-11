import { NetworkConfig, Signature, SignerWallet, RawTransaction, Protocol, PROTOCOL, NearProtocol } from "@restake/stakejs-core";
import { WalletSelector } from "@near-wallet-selector/core";

export class NearSelectorWallet implements SignerWallet {
    selector: WalletSelector;

    constructor(selector: WalletSelector) {
        this.selector = selector;
    }

    async getAddress<P extends Protocol>(networkConfig: NetworkConfig<P>, selector?: string): Promise<string> {
        if (networkConfig.protocol !== PROTOCOL.NEAR_PROTOCOL) {
            throw new Error("NearSelectorWallet only supports Near Protocol.");
        }

        const account = this.selector.wallet.getAccounts(parseInt(selector || "0"));

        return account.accountId || account.publicKey;
    }

    async getPublicKey<P extends Protocol>(networkConfig: NetworkConfig<P>, selector?: string): Promise<string> {
        if (networkConfig.protocol !== PROTOCOL.NEAR_PROTOCOL) {
            throw new Error("NearSelectorWallet only supports Near Protocol.");
        }

        const account = this.selector.wallet.getAccounts(parseInt(selector || "0"));

        return account.publicKey;
    }

    async sign(): Promise<Signature> {
        throw new Error("Cannot do raw signing with NearSelectorWallet.");
    }

    async signAndBroadcast(
        rawTx: RawTransaction<NearProtocol>,
    ): Promise<void> {
        this.selector.wallet.signAndSendTransactions({ transactions: [rawTx] });
    }
}
