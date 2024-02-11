import { NetworkConfig, Signature, SignerWallet, Protocol, PROTOCOL } from "@restake/stake.js-core";
import { NearProtocolRawTransaction } from "@restake/stake.js-near-protocol";
import { WalletSelector, FunctionCallAction } from "@near-wallet-selector/core";

export class NearSelectorWallet implements SignerWallet {
    walletSelector;

    constructor(walletSelector: WalletSelector) {
        this.walletSelector = walletSelector;
    }

    async getAddress<P extends Protocol>(networkConfig: NetworkConfig<P>, selector?: string): Promise<string> {
        if (networkConfig.protocol !== PROTOCOL.NEAR_PROTOCOL) {
            throw new Error("NearSelectorWallet only supports Near Protocol.");
        }

        const wallet = await this.walletSelector.wallet();
        const accounts = await wallet.getAccounts();

        if (!selector) {
            const account = accounts[0];

            return account.accountId || account.publicKey;
        } else {
            const account = accounts.find((account: { accountId: string }) => account.accountId === selector);

            if (!account) {
                throw new Error(`Account with selector ${selector} not found.`);
            }

            return account.accountId || account.publicKey;
        }
    }

    async getPublicKey<P extends Protocol>(networkConfig: NetworkConfig<P>, selector?: string): Promise<string> {
        if (networkConfig.protocol !== PROTOCOL.NEAR_PROTOCOL) {
            throw new Error("NearSelectorWallet only supports Near Protocol.");
        }

        const wallet = await this.walletSelector.wallet();
        const accounts = await wallet.getAccounts();

        if (!selector) {
            const account = accounts[0];

            return account.accountId || account.publicKey;
        } else {
            const account = accounts.find((account: { accountId: string }) => account.accountId === selector);

            if (!account) {
                throw new Error(`Account with selector ${selector} not found.`);
            }

            return account.accountId || account.publicKey;
        }
    }

    async sign(): Promise<Signature> {
        throw new Error("Cannot do raw signing with NearSelectorWallet.");
    }

    async signAndBroadcast(
        rawTx: NearProtocolRawTransaction,
    ): Promise<void> {

        const transaction = rawTx.transaction;

        const transformed: { signerId: string, receiverId: string, actions: FunctionCallAction[] } = {
            signerId: transaction.signerId,
            receiverId: transaction.receiverId,
            actions: [],
        };

        transaction.actions.forEach((action) => {
            if (action.functionCall) {
                // Decode the Uint8Array args to a string
                const argsString = new TextDecoder().decode(action.functionCall.args);
                const argsObject = JSON.parse(argsString);

                const transformedAction = {
                    type: "FunctionCall",
                    params: {
                        methodName: action.functionCall.methodName,
                        args: argsObject,
                        gas: action.functionCall.gas.toString(), // Convert BN to string
                        deposit: action.functionCall.deposit.toString(), // Convert BN to string
                    },
                };

                transformed.actions.push(transformedAction);
            }
        });

        const wallet = await this.walletSelector.wallet();
        await wallet.signAndSendTransactions({ transactions: [transformed] });
    }
}
