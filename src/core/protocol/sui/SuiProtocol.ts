import { TransactionBroadcaster } from "../../network/broadcaster.js";
import { jsonrpc } from "../../utils/http.js";
import { SuiSigner } from "./SuiSigner.js";
import { SignedTransaction, Transaction } from "./SuiTransaction.js";
import { DelegatedStake } from "./types.ts";

import { SUI_SYSTEM_STATE_OBJECT_ID, SuiTransactionBlockResponse, TransactionBlock } from "@mysten/sui.js";

export type SuiBroadcastResponse = SuiTransactionBlockResponse;

export class SuiProtocol implements TransactionBroadcaster<SignedTransaction, SuiBroadcastResponse> {
    static INSTANCE = new SuiProtocol();

    private constructor() {
        // No-op
    }

    async createTransferTransaction(
        signer: SuiSigner,
        recipientAddress: string,
        amount: bigint,
        baseTx?: TransactionBlock,
        senderAddress?: string,
    ): Promise<Transaction> {
        const tx = new TransactionBlock(baseTx);
        const [ coin ] = tx.splitCoins(tx.gas, [
            tx.pure(Number(amount)),
        ]);

        tx.transferObjects([ coin ], tx.pure(recipientAddress));

        if (senderAddress) {
            tx.setSender(senderAddress);
        }

        return {
            network: signer.network,
            payload: tx,
        };
    }

    async createAddStakeTransaction(
        signer: SuiSigner,
        validatorAddress: string,
        amount: bigint,
        baseTx?: TransactionBlock,
    ): Promise<Transaction> {
        const tx = new TransactionBlock(baseTx);
        const stakeCoin = tx.splitCoins(tx.gas, [
            tx.pure(Number(amount)),
        ]);

        // eslint-disable-next-line max-len
        // https://github.com/MystenLabs/sui/blob/03df554cc9fcd0ddf4128b32397e60a700955749/apps/wallet/src/ui/app/staking/stake/utils/transaction.ts#L6
        tx.moveCall({
            target: "0x3::sui_system::request_add_stake",
            arguments: [
                tx.sharedObjectRef({
                    objectId: SUI_SYSTEM_STATE_OBJECT_ID,
                    initialSharedVersion: 1,
                    mutable: true,
                }),
                stakeCoin,
                tx.pure(validatorAddress, "address"),
            ],
        });

        return {
            network: signer.network,
            payload: tx,
        };
    }

    async createWithdrawStakeTransaction(
        signer: SuiSigner,
        stakedSuiId: string,
        baseTx?: TransactionBlock,
    ): Promise<Transaction> {
        const tx = new TransactionBlock(baseTx);

        // eslint-disable-next-line max-len
        // https://github.com/MystenLabs/sui/blob/03df554cc9fcd0ddf4128b32397e60a700955749/apps/wallet/src/ui/app/staking/stake/utils/transaction.ts#L24
        tx.moveCall({
            target: "0x3::sui_system::request_withdraw_stake",
            arguments: [
                tx.object(SUI_SYSTEM_STATE_OBJECT_ID),
                tx.object(stakedSuiId),
            ],
        });

        return {
            network: signer.network,
            payload: tx,
        };
    }

    async getStakedSuiIds(signer: SuiSigner): Promise<DelegatedStake[]> {
        // https://docs.sui.io/sui-jsonrpc#suix_getStakes

        const endpoint = new URL(signer.network.rpcUrl);

        return await jsonrpc<DelegatedStake[]>(endpoint, "suix_getStakes", [signer.address]);
    }

    async broadcast(signedTransaction: SignedTransaction): Promise<SuiBroadcastResponse> {
        // https://docs.sui.io/sui-jsonrpc#sui_executeTransactionBlock

        const endpoint = new URL(signedTransaction.transaction.network.rpcUrl);

        const { transactionBlockBytes, signature } = signedTransaction.payload;
        const signatures = Array.isArray(signature) ? signature : [signedTransaction.payload.signature];

        return jsonrpc<SuiBroadcastResponse>(endpoint, "sui_executeTransactionBlock", [
            transactionBlockBytes,
            signatures,
            null,
            null,
        ]);
    }

    async broadcastSimple(signedTransaction: SignedTransaction): Promise<string> {
        const response = await this.broadcast(signedTransaction);

        return response.digest;
    }
}
