import { NEAR_NOMINATION } from "near-api-js/lib/utils/format.js";
import { TransactionBroadcaster } from "../../network/broadcaster.js";
import { NEARSigner } from "./NEARSigner.js";
import { BlockFinality, NEARNetwork } from "./network.js";
import { BNFromBigInt } from "../../utils/bigint.js";

import BN from "bn.js";
import { transactions } from "near-api-js";
import { SignedTransaction, Transaction, functionCall } from "near-api-js/lib/transaction.js";

const ZERO = new BN(0);
const STAKING_GAS = new BN(300e12);

export class NEARProtocol implements TransactionBroadcaster<SignedTransaction, unknown> {
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
        const signerId = signer.accountId();
        const nearPublicKey = await signer.nearPublicKey();
        const nonce = await signer.fetchNonce();
        const blockHash = ["final", "optimistic"].includes(block) ? await signer.fetchBlockHash(block as BlockFinality) : block;


        // TODO
        const nonceBN = BNFromBigInt(nonce);
        const blockHashRaw = new Uint8Array();

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

        const action = functionCall(methodName, args, STAKING_GAS, depositAmount ? BNFromBigInt(depositAmount) : ZERO);
        return transactions.createTransaction(signerId, nearPublicKey, stakingPoolAccountId, nonceBN, [action], blockHashRaw);
    }

    async createUnstakeTransaction(
        signer: NEARSigner,
        stakingPoolAccountId: string,
        amount: BigInt | "all" = "all",
    ): Promise<Uint8Array> {

        const methodName = amount ? "unstake" : "unstake_all";
        let args: Record<string, unknown> = {};
        if (amount !== "all") {
            args.amount = amount.toString()
        }

        throw new Error("Not implemented");
    }

    async createDepositTransaction(
        signer: NEARSigner,
        stakingPoolAccountId: string,
        depositAmount: BigInt | "all" = "all",
    ): Promise<Uint8Array> {
        throw new Error("Not implemented");
    }

    async createWithdrawTransaction(
        signer: NEARSigner,
        stakingPoolAccountId: string,
        withdrawAmount: BigInt | "all" = "all",
    ): Promise<Uint8Array> {
        throw new Error("Not implemented");
    }

    async broadcast(signedTransaction: unknown): Promise<undefined> {
        throw new Error("Method not implemented.");
    }

    async broadcastSimple(signedTransaction: unknown): Promise<string> {
        throw new Error("Method not implemented.");
    }
}


/**
 * Converts NEAR to yoctoNEAR. Effectively applies exponent of 24 to the value.
 *
 * @param amount Amount to convert
 * @returns Amount in yoctoNEAR
 */
export function ntoy(amount: string | number | BN | BigInt): BN {
    return new BN(amount instanceof BigInt ? BNFromBigInt(amount) : amount).mul(NEAR_NOMINATION);
}
