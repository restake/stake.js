import BN from "bn.js";

import * as nearApi from "near-api-js";
import { PublicKey } from "near-api-js/lib/utils/index.js";
import { AccessKeyInfoView } from "near-api-js/lib/providers/provider.js";
import { Account, connect, Near } from "near-api-js";
import {
    NearProtocolNetwork,
    NearProtocolNetworkConfig,
    NearProtocolRawTransaction,
    NearProtocolSignedTransaction,
} from "./types.ts";
import { NEAR_PROTOCOL_DEFAULT_RPC_URLS } from "./constants.ts";
import { SignerWallet, TransactionEngine, NearProtocol } from "@restake/stakejs-core";

const ZERO_BN = new BN(0);
const MAX_GAS_BN = new BN(300e12);

enum NearStakingMethods {
    deposit = "deposit",
    stake = "stake",
    depositAndStake = "deposit_and_stake",
    unstake = "unstake",
    withdraw = "withdraw",
    unstakeAll =  "unstake_all",
    withdrawAll = "withdraw_all"
}

const toYocto = ((amount: number): string => {
    const yoctoAmount: string | null = nearApi.utils.format.parseNearAmount(amount.toString());
    if (!yoctoAmount) {
        throw new Error(`Unable to parse NEAR amount ${amount}`);
    }

    return yoctoAmount;
});

export class NearProtocolTransactionEngine implements TransactionEngine<NearProtocol> {
    rpcUrl: URL;
    networkConfig: NearProtocolNetworkConfig;
    near?: Near;


    constructor(network: NearProtocolNetwork = { name: "mainnet" }, rpcUrl?: URL) {
        this.networkConfig = { protocol: "near-protocol", network: network };
        this.rpcUrl = rpcUrl || NEAR_PROTOCOL_DEFAULT_RPC_URLS[network.name];
    }

    async init() {
        this.near = await connect({
            networkId: this.networkConfig.network.name,
            nodeUrl: this.rpcUrl.toString(),
        });
    }

    async getNear(): Promise<Near> {
        if (!this.near) {
            await this.init();
        }

        return this.near as Near;
    }

    private buildAction(method: NearStakingMethods, amount?: number): nearApi.transactions.Action {
        let action: nearApi.transactions.Action;

        switch (method) {
        case NearStakingMethods.deposit:
        case NearStakingMethods.depositAndStake:
            if (!amount) {
                throw new Error("You need to specify an amount to stake.");
            } else {
                action = nearApi.transactions.functionCall(method, {}, MAX_GAS_BN, new BN(toYocto(amount)));
            }
            break;
        case NearStakingMethods.stake:
        case NearStakingMethods.unstake :
        case NearStakingMethods.withdraw:
            if (typeof amount === "undefined") {
                throw new Error(`You need to specify an amount to ${method}.`);
            } else {
                action = nearApi.transactions.functionCall(
                    method,
                    { amount: toYocto(amount) }, MAX_GAS_BN, ZERO_BN);
            }
            break;
        case NearStakingMethods.unstakeAll:
        case NearStakingMethods.withdrawAll:
            action = nearApi.transactions.functionCall(method, {}, MAX_GAS_BN, ZERO_BN);
            break;
        default:
            throw new Error(`Unknwon method ${method}.`);
        }

        return action;
    }

    private async buildTransaction(
        wallet: SignerWallet,
        method: NearStakingMethods,
        validator: string,
        amount?: number,
        accountId?: string,
        selector?: string,
    ): Promise<NearProtocolRawTransaction> {

        const near: Near = await this.getNear();
        let accessKey: AccessKeyInfoView | undefined;

        const signerId = accountId || await wallet.getAddress(this.networkConfig, selector);
        const account: Account = await near.account(signerId);

        if (accountId) {
            // There should always be a public key available if the account is not implicit
            const accountPk = await wallet.getPublicKey(this.networkConfig, selector);
            const accessKeys: AccessKeyInfoView[] = await account.getAccessKeys();
            accessKey = accessKeys.find(
                (accessKey) =>
                    (accessKey.public_key === accountPk) &&
                    (accessKey.access_key.permission === "FullAccess"));

            if(!accessKey) {
                throw new Error(`Could not find Full Access Key for account [ ${accountId} ]`);
            }
        } else {
            const accessKeys = await account.getAccessKeys();
            accessKey = accessKeys[0];
        }

        const publicKey = PublicKey.fromString(accessKey.public_key);
        const nonce = accessKey?.access_key.nonce.add(new BN(1));

        const actions: Array<nearApi.transactions.Action> = [this.buildAction(method, amount)];
        const queryAccessKey = await near.connection.provider.query(`access_key/${ signerId }/${ publicKey.toString() }`, "");
        const recentBlockHash = nearApi.utils.serialize.base_decode(queryAccessKey.block_hash);


        const nearApiRawTx = nearApi.transactions.createTransaction(
            signerId, publicKey, validator, nonce, actions, recentBlockHash);

        const rawTx = new NearProtocolRawTransaction(nearApiRawTx);

        return rawTx;
    }

    async buildDepositTx(
        wallet: SignerWallet,
        validator: string,
        amount: number,
        accountId?: string,
        selector?: string,
    ): Promise<NearProtocolRawTransaction> {
        return await this.buildTransaction(wallet, NearStakingMethods.deposit, validator, amount, accountId, selector);
    }

    async buildDepositAndStakeTx(
        wallet: SignerWallet,
        validator: string,
        amount: number,
        accountId?: string,
        selector?: string,
    ): Promise<NearProtocolRawTransaction> {
        return await this.buildTransaction(wallet, NearStakingMethods.depositAndStake, validator, amount, accountId, selector);
    }

    async buildStakeTx(
        wallet: SignerWallet,
        validator: string,
        amount: number,
        accountId?: string,
        selector?: string,
    ): Promise<NearProtocolRawTransaction> {
        return await this.buildTransaction(wallet, NearStakingMethods.stake, validator, amount, accountId, selector);
    }

    async buildUnstakeTx(
        wallet: SignerWallet,
        validator: string,
        amount: number | "all",
        accountId?: string,
        selector?: string,
    ): Promise<NearProtocolRawTransaction> {
        const method = amount === "all" ? NearStakingMethods.unstakeAll : NearStakingMethods.unstake;

        return await this.buildTransaction(wallet, method, validator, amount === "all" ? undefined : amount, accountId, selector);
    }

    async buildWithdrawTx(
        wallet: SignerWallet,
        validator: string,
        amount: number | "all",
        accountId?: string,
        selector?: string,
    ): Promise<NearProtocolRawTransaction> {
        const method = amount === "all" ? NearStakingMethods.withdrawAll : NearStakingMethods.withdraw;

        return await this.buildTransaction(wallet, method, validator, amount === "all" ? undefined : amount, accountId, selector);
    }

    async sign(
        wallet: SignerWallet,
        rawTx: NearProtocolRawTransaction,
        selector?: string | undefined,
    ): Promise<NearProtocolSignedTransaction> {
        const signature = await wallet.sign(rawTx, this.networkConfig, selector);
        const signedTx = new NearProtocolSignedTransaction(rawTx.transaction, signature);

        return signedTx;
    }

    async broadcast(signedTx: NearProtocolSignedTransaction): Promise<string> {
        try {
            const near = await this.getNear();
            const result = await near.connection.provider.sendTransaction(signedTx.transaction);

            return result.transaction.hash;
        } catch(error) {
            console.log("An error occurred while trying to broadcast the transaction.");
            throw error;
        }
    }
}
