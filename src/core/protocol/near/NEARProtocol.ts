import { BlockFinality, isFinality } from "./network.js";
import { BNFromBigInt } from "../../utils/bigint.js";
import { encode as b64Encode } from "../../utils/base64.js";
import { jsonrpc } from "../../utils/http.js";
import { NEARSigner } from "./NEARSigner.js";
import { SignedTransaction, Transaction } from "./NEARTransaction.js";
import { TransactionBroadcaster } from "../../network/broadcaster.js";

import { functionCall } from "near-api-js/lib/transaction.js";
import { NEAR_NOMINATION } from "near-api-js/lib/utils/format.js";
import { transactions } from "near-api-js";
import BN from "bn.js";
import bs58 from "bs58";

const ZERO = new BN(0);
const STAKING_GAS = new BN(300e12);

/**
 *
 */
export type NEARBroadcastResponse = string;

export class NEARProtocol implements TransactionBroadcaster<SignedTransaction, NEARBroadcastResponse> {
    static INSTANCE = new NEARProtocol();

    private constructor() {
        // No-op
    }

    private async buildFunctionCallTransaction(
        signer: NEARSigner,
        contact: string,
        methodName: string,
        args: Record<string, unknown>,
        gas: BN,
        block: BlockFinality | string,
        depositAmount?: bigint,
    ): Promise<Transaction> {
        const blockHash = isFinality(block) ? await signer.fetchBlockHash(block) : block;
        const nonce = await signer.fetchNonce();

        const blockHashRaw = decodeBlockHash(blockHash);
        const nonceBN = BNFromBigInt(nonce + 1n);

        const action = functionCall(methodName, args, gas, depositAmount ? BNFromBigInt(depositAmount) : ZERO);
        const payload = transactions.createTransaction(signer.accountId, signer.nearPublicKey, contact, nonceBN, [action], blockHashRaw);

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
        depositAmount?: bigint,
        stakeAmount: bigint | "all" = "all",
        block: BlockFinality | string = "final",
    ): Promise<Transaction> {
        let methodName: string;
        const args: Record<string, unknown> = {};
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
     * Create NEAR unstaking transaction
     *
     * @param signer NEAR signer. Needed to determine access key nonce and block hash
     * @param stakingPoolAccountId Staking pool account ID
     * @param amount Amount of tokens to unstake from the staking pool
     * @param block Block to attach this transaction to
     * @returns Unsigned transaction
     */
    async createUnstakeTransaction(
        signer: NEARSigner,
        stakingPoolAccountId: string,
        amount: bigint | "all" = "all",
        block: BlockFinality | string = "final",
    ): Promise<Transaction> {
        const methodName = amount !== "all" ? "unstake" : "unstake_all";
        const args: Record<string, unknown> = {};
        if (amount !== "all") {
            args.amount = amount.toString();
        }

        return this.buildFunctionCallTransaction(signer, stakingPoolAccountId, methodName, args, STAKING_GAS, block, 0n);
    }

    /**
     * Create NEAR deposit transaction
     *
     * @param signer NEAR signer. Needed to determine access key nonce and block hash
     * @param stakingPoolAccountId Staking pool account ID
     * @param depositAmount Amount to deposit to the staking pool
     * @param block Block to attach this transaction to
     * @returns Unisigned transaction
     */
    async createDepositTransaction(
        signer: NEARSigner,
        stakingPoolAccountId: string,
        depositAmount: bigint,
        block: BlockFinality | string = "final",
    ): Promise<Transaction> {
        const methodName = "deposit";
        const args: Record<string, unknown> = {};

        return this.buildFunctionCallTransaction(signer, stakingPoolAccountId, methodName, args, STAKING_GAS, block, depositAmount);
    }

    /**
     * Create NEAR withdraw transaction
     *
     * @param signer NEAR signer. Needed to determine access key nonce and block hash
     * @param stakingPoolAccountId Staking pool account ID
     * @param withdrawAmount Amount to withdraw from the staking pool
     * @param block Block to attach this transaction to
     * @returns Unsigned transaction
     */
    async createWithdrawTransaction(
        signer: NEARSigner,
        stakingPoolAccountId: string,
        withdrawAmount: bigint | "all" = "all",
        block: BlockFinality | string = "final",
    ): Promise<Transaction> {
        const methodName = withdrawAmount !== "all" ? "withdraw" : "withdraw_all";
        const args: Record<string, unknown> = {};
        if (withdrawAmount !== "all") {
            args.amount = withdrawAmount.toString();
        }

        return this.buildFunctionCallTransaction(signer, stakingPoolAccountId, methodName, args, STAKING_GAS, block, 0n);
    }

    async broadcast(signedTransaction: SignedTransaction): Promise<NEARBroadcastResponse> {
        // https://docs.near.org/api/rpc/transactions#send-transaction-async

        const endpoint = new URL(signedTransaction.transaction.network.rpcUrl);
        const encodedPayload = b64Encode(signedTransaction.payload.encode());

        const response = await jsonrpc<string>(endpoint, "broadcast_tx_async", [
            encodedPayload,
        ]);

        return response;
    }

    async broadcastSimple(signedTransaction: SignedTransaction): Promise<string> {
        const response = await this.broadcast(signedTransaction);

        return response;
    }
}

/**
 *
 * @param blockHash
 * @returns
 */
function decodeBlockHash(blockHash: string): Uint8Array {
    const decoded = bs58.decode(blockHash);

    // 32 = sha256 in bytes
    if (decoded.byteLength !== 32) {
        throw new Error("Block hash length is expected to be 32 bytes, got " + decoded.byteLength);
    }

    return decoded;
}

/**
 * Converts NEAR to yoctoNEAR. Effectively applies exponent of 24 to the value.
 *
 * @param amount Amount to convert
 * @returns Amount in yoctoNEAR
 */
export function ntoy(amount: string | number | BN | bigint): bigint {
    // TODO: drop BN + it's broken anyway.
    const bn = new BN(typeof amount === "bigint" ? BNFromBigInt(amount) : amount).mul(NEAR_NOMINATION);

    return BigInt(bn.toString());
}
