import { NearProtocol, NetworkConfig, RawTransaction, SignedTransaction } from "../index.ts";
import { BaseTransactionEngine } from "../../transactions/index.ts";
import { SignerWallet } from "../../wallets/index.ts";
import { PROTOCOL } from "../constants.ts";
import { NearProtocolNetwork } from "./types.ts";
import { NEAR_PROTOCOL_DEFAULT_RPC_URLS } from "./constants.ts";
import BN from "bn.js";

import * as nearAPI from "near-api-js";
import { Action, functionCall } from "near-api-js/lib/transaction.js";
import { PublicKey } from "near-api-js/lib/utils/index.js";
import { AccessKeyInfoView } from "near-api-js/lib/providers/provider.js";
import { Account, connect, Near } from "near-api-js";

const ZERO_BN = new BN(0);
const MAX_GAS_BN = new BN(300e12);

enum NearStakingMethods {
    stake = "deposit_and_stake",
    unstake = "unstake",
    withdraw = "withdraw",
    unstakeAll =  "unstake_all",
    withdrawAll = "withdraw_all"
}

const toYocto = ((amount: number): string => {
    const yoctoAmount: string | null = nearAPI.utils.format.parseNearAmount(amount.toString());
    if (!yoctoAmount) {
        throw new Error(`Unable to parse NEAR amount ${amount}`);
    }

    return yoctoAmount;
});

export class NearProtocolTransactionEngine extends BaseTransactionEngine<NearProtocol> {
    rpcUrl: URL;
    networkConfig: NetworkConfig<NearProtocol>;
    near?: Near;


    constructor(network: NearProtocolNetwork = "mainnet", rpcUrl?: URL) {
        super();
        this.networkConfig = { protocol: PROTOCOL.NEAR_PROTOCOL, network: network };
        this.rpcUrl = rpcUrl || NEAR_PROTOCOL_DEFAULT_RPC_URLS[network];
    }

    async init() {
        this.near = await connect({
            networkId: this.networkConfig.network,
            nodeUrl: this.rpcUrl.toString(),
        });
    }

    async getNear(): Promise<Near> {
        if (!this.near) {
            await this.init();
        }

        return this.near as Near;
    }

    private buildAction(method: NearStakingMethods, amount?: number): Action {
        let action: Action;

        switch (method) {
        case NearStakingMethods.stake:
            if (!amount) {
                throw new Error("You need to specify an amount to stake.");
            } else {
                action = functionCall(method, {}, MAX_GAS_BN, new BN(toYocto(amount)));
            }
            break;
        case NearStakingMethods.unstake :
        case NearStakingMethods.withdraw:
            if (typeof amount === "undefined") {
                throw new Error(`You need to specify an amount to ${method}.`);
            } else {
                action = functionCall(
                    method,
                    { amount: toYocto(amount) }, MAX_GAS_BN, ZERO_BN);
            }
            break;
        case NearStakingMethods.unstakeAll:
        case NearStakingMethods.withdrawAll:
            action = functionCall(method, {}, MAX_GAS_BN, ZERO_BN);
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
    ): Promise<RawTransaction<NearProtocol>> {
        const near: Near = await this.getNear();

        if (!accountId) {
            accountId = await wallet.getAddress(this.networkConfig, selector);
        }

        const publicKeyString = await wallet.getPublicKey(this.networkConfig, selector);

        const account: Account = await near.account(accountId);
        const accessKeys: AccessKeyInfoView[] = await account.getAccessKeys();
        const fullAccessKey: AccessKeyInfoView | undefined = accessKeys.find(
            (accessKey) =>
                (accessKey.public_key === publicKeyString) &&
                (accessKey.access_key.permission === "FullAccess"));

        if(!fullAccessKey) {
            throw new Error(`Could not find Full Access Key for account [ ${accountId} ]`);
        }

        const publicKey: PublicKey = PublicKey.from(fullAccessKey.public_key);

        const nonce: BN = fullAccessKey.access_key.nonce.add(new BN(1));

        const actions: Array<Action> = [this.buildAction(method, amount)];

        const accessKey = await near.connection.provider.query(`access_key/${ accountId }/${ publicKey.toString() }`, "");
        const recentBlockHash = nearAPI.utils.serialize.base_decode(accessKey.block_hash);

        const rawTx: RawTransaction<NearProtocol> = nearAPI.transactions.createTransaction(
            accountId, publicKey, validator, nonce, actions, recentBlockHash);

        return rawTx;
    }

    async buildStakeTx(
        wallet: SignerWallet,
        validator: string,
        amount: number,
        accountId?: string,
        selector?: string,
    ): Promise<RawTransaction<NearProtocol>> {
        return await this.buildTransaction(wallet, NearStakingMethods.stake, validator, amount, accountId, selector);
    }

    async buildUnstakeTx(
        wallet: SignerWallet,
        validator: string,
        amount: number | "all",
        accountId?: string,
        selector?: string,
    ): Promise<RawTransaction<NearProtocol>> {
        const method = amount === "all" ? NearStakingMethods.unstakeAll : NearStakingMethods.unstake;

        return await this.buildTransaction(wallet, method, validator, amount === "all" ? undefined : amount, accountId, selector);
    }

    async buildWithdrawTx(
        wallet: SignerWallet,
        validator: string,
        amount: number | "all",
        accountId?: string,
        selector?: string,
    ): Promise<RawTransaction<NearProtocol>> {
        const method = amount === "all" ? NearStakingMethods.withdrawAll : NearStakingMethods.withdraw;

        return await this.buildTransaction(wallet, method, validator, amount === "all" ? undefined : amount, accountId, selector);
    }

    async broadcast(signedTx: SignedTransaction<NearProtocol>): Promise<string> {
        try {
            const near = await this.getNear();
            const result = await near.connection.provider.sendTransaction(signedTx);

            return result.transaction.hash;
        } catch(error) {
            console.log("An error occurred while trying to broadcast the transaction.");
            throw error;
        }
    }
}
