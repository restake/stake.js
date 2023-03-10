import { NEARSigner } from "./NEARSigner.js";
import { SignedTransaction, Transaction } from "./NEARTransaction.js";
import { TransactionBroadcaster } from "../../network/broadcaster.js";
import { BlockFinality } from "./network.js";
import { BNFromBigInt } from "../../utils/bigint.js";

import BN from "bn.js";
import { transactions } from "near-api-js";
import { functionCall } from "near-api-js/lib/transaction.js";
import { NEAR_NOMINATION } from "near-api-js/lib/utils/format.js";

const ZERO = new BN(0);
const STAKING_GAS = new BN(300e12);

/**
 *
 */
export type NEARBroadcastResponse = {

};

export class NEARProtocol implements TransactionBroadcaster<SignedTransaction, NEARBroadcastResponse> {
    static INSTANCE = new NEARProtocol();

    private constructor() {
        // no-op
    }

    private async buildFunctionCallTransaction(
        signer: NEARSigner,
        contact: string,
        methodName: string,
        args: Record<string, unknown>,
        gas: BN,
        block: BlockFinality | string,
        depositAmount?: BigInt,
    ): Promise<Transaction> {
        const blockHash = ["final", "optimistic"].includes(block) ? await signer.fetchBlockHash(block as BlockFinality) : block;
        const nonce = await signer.fetchNonce();

        // TODO
        const nonceBN = BNFromBigInt(0n);
        const blockHashRaw = new Uint8Array();

        const publicKey = await signer.nearPublicKey();

        const action = functionCall(methodName, args, gas, depositAmount ? BNFromBigInt(depositAmount) : ZERO);
        const payload = transactions.createTransaction(signer.accountId, publicKey, contact, nonceBN, [action], blockHashRaw);

        return {
            payload,
            network: signer.network,
        };
    }

    /**
     * Constructs a staking transaction
     *
     * @param signer NEAR signer. Needed to determine access key nonce and block hash
     * @param stakingPoolAccountId Staking pool account ID
     * @param depositAmount Amount to deposit to the staking pool
     * @param stakeAmount Amount of tokens deposited to staking pool to stake
     * @param block Block to attach this transaction to
     * @returns Unsigned transaction
     */
    async createStakeTransaction(
        signer: NEARSigner,
        stakingPoolAccountId: string,
        depositAmount?: BigInt,
        stakeAmount: BigInt | "all" = "all",
        block: BlockFinality | string = "final",
    ): Promise<Transaction> {
        let methodName: string;
        let args: Record<string, unknown> = {};
        if (stakeAmount === "all") {
            methodName = depositAmount ? "deposit_and_stake" : "stake_all";
        } else {
            if (depositAmount) {
                throw new Error("depositAmount cannot be specified when stakeAmount is not set to 'all'");
            }

            methodName = stakeAmount ? "stake" : "stake_all";
            if (stakeAmount) {
                args.amount = stakeAmount.toString();
            }
        }

        return this.buildFunctionCallTransaction(signer, stakingPoolAccountId, methodName, args, STAKING_GAS, block, depositAmount);
    }

    /**
     *
     * @param signer
     * @param stakingPoolAccountId
     * @param amount
     * @param block
     * @returns
     */
    async createUnstakeTransaction(
        signer: NEARSigner,
        stakingPoolAccountId: string,
        amount: BigInt | "all" = "all",
        block: BlockFinality | string = "final",
    ): Promise<Transaction> {
        const methodName = amount !== "all" ? "unstake" : "unstake_all";
        let args: Record<string, unknown> = {};
        if (amount !== "all") {
            args.amount = amount.toString()
        }

        return this.buildFunctionCallTransaction(signer, stakingPoolAccountId, methodName, args, STAKING_GAS, block, 0n);
    }

    /**
     *
     * @param signer
     * @param stakingPoolAccountId
     * @param depositAmount
     * @param block
     * @returns
     */
    async createDepositTransaction(
        signer: NEARSigner,
        stakingPoolAccountId: string,
        depositAmount: BigInt,
        block: BlockFinality | string = "final",
    ): Promise<Transaction> {
        const methodName = "deposit";
        let args: Record<string, unknown> = {};

        return this.buildFunctionCallTransaction(signer, stakingPoolAccountId, methodName, args, STAKING_GAS, block, depositAmount);
    }

    /**
     *
     * @param signer
     * @param stakingPoolAccountId
     * @param withdrawAmount
     * @param block
     * @returns
     */
    async createWithdrawTransaction(
        signer: NEARSigner,
        stakingPoolAccountId: string,
        withdrawAmount: BigInt | "all" = "all",
        block: BlockFinality | string = "final",
    ): Promise<Transaction> {
        const methodName = withdrawAmount !== "all" ? "withdraw" : "withdraw_all";
        let args: Record<string, unknown> = {};
        if (withdrawAmount !== "all") {
            args.amount = withdrawAmount.toString();
        }

        return this.buildFunctionCallTransaction(signer, stakingPoolAccountId, methodName, args, STAKING_GAS, block, 0n);
    }

    async broadcast(signedTransaction: SignedTransaction): Promise<NEARBroadcastResponse> {
        throw new Error("Method not implemented.");
    }

    async broadcastSimple(signedTransaction: SignedTransaction): Promise<string> {
        const response = await this.broadcast(signedTransaction);

        // TODO: extract transaction hash from NEARBroadcastResponse
        throw new Error("Method not implemented.");
    }
}


/**
 * Converts NEAR to yoctoNEAR. Effectively applies exponent of 24 to the value.
 *
 * @param amount Amount to convert
 * @returns Amount in yoctoNEAR
 */
export function ntoy(amount: string | number | BN | BigInt): BigInt {
    // TODO: drop BN
    const bn = new BN(amount instanceof BigInt ? BNFromBigInt(amount) : amount).mul(NEAR_NOMINATION);
    return BigInt(bn.toString());
}
