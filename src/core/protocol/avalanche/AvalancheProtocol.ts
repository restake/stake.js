import { AvalancheSigner } from "./AvalancheSigner.js";
import { jsonrpc } from "../../utils/http.js";
import { SignedTransaction, Transaction } from "./AvalancheTransaction.js";
import { TransactionBroadcaster } from "../../network/broadcaster.js";

import { BinTools, BN } from "avalanche";

export type AvalancheBroadcastResponse = {
    txID: string;
};

export class AvalancheProtocol implements TransactionBroadcaster<SignedTransaction, AvalancheBroadcastResponse> {
    static INSTANCE = new AvalancheProtocol();

    private constructor() {
        // no-op
    }

    /**
     * Constructs a staking transaction.
     *
     * See https://docs.avax.network/nodes/validate/staking for staking parameters
     *
     * @param signer Avalanche signer.
     * @param validator Validator account ID
     * @param amount Amount to delegate to the validator
     * @param dateStart Starting time date-time object of the validation process
     * @param dateEnd Starting time date-time object of the validation process
     * @param rewardLockTime The locktime field created in the resulting reward outputs
     * @returns Unsigned transaction
     */
    async buildStakeTransaction(
        signer: AvalancheSigner,
        validator: string,
        amount: string,
        dateStart: Date,
        dateEnd: Date,
        rewardLockTime?: BigInt,
    ): Promise<Transaction> {
        const pAddress: string = await signer.deriveAddress("P");
        const pChain = signer.client.PChain();
        const chainId = pChain.getBlockchainID();

        const { utxos } = await pChain.getUTXOs(pAddress, chainId);

        const stakeAmountAddress = [pAddress];
        const utxoFeeAddress =[pAddress];
        const utxoFeeLeftoverAddress = [pAddress];
        const rewardAddress = [pAddress];

        const tx = await pChain.buildAddDelegatorTx(
            utxos,
            stakeAmountAddress,
            utxoFeeAddress,
            utxoFeeLeftoverAddress,
            validator,
            new BN(dateStart.getTime() / 1000),
            new BN(dateEnd.getTime() / 1000),
            new BN(amount),
            rewardAddress,
            rewardLockTime ? new BN(rewardLockTime.toString()) : undefined,
            undefined,
            undefined,
            undefined,
        );

        return {
            payload: tx,
            network: signer.network,
        };
    }

    /**
     * Gets all reward UTXOs of a specified P-Chain address
     *
     * @param signer Avalanche signer.
     * @returns Array of all the UTXOs
     */
    private async getAllUTXOs(
        signer: AvalancheSigner
    ): Promise<string[]> {
        const pAddress: string = await signer.deriveAddress("P");
        const pChain = signer.client.PChain();
        const chainId = pChain.getBlockchainID();
        const { utxos } = await pChain.getUTXOs(pAddress, chainId);
        const array = utxos.getAllUTXOStrings();

        return array;
    }

    /**
     * Gets the UTXO amount of a specified staking transaction
     *
     * @param signer Avalanche signer.
     * @param txID The ID of a staking transaction
     * @returns The reward amount
     */
    private async getAmount(
        txID: string,
        signer: AvalancheSigner
    ): Promise<number | null> {
        const pChain = signer.client.PChain();
        const rewardUTXO = await pChain.getRewardUTXOs(txID);

        if (rewardUTXO.utxos.length <= 0) {
            return null;
        }

        const amountOne = parseInt(rewardUTXO.utxos[0].slice(150, 166), 16);
        const amountTwo = parseInt(rewardUTXO.utxos[1].slice(150, 166), 16);

        if (amountOne < amountTwo) {return amountTwo}
        else {return amountOne};
    }

    /**
     * Decodes a CB58 encoded transactionID
     *
     * @param txIDCB58 CB58 encoded string of a transactionID
     * @returns Decoded trsansactionID
     */
    private async getTxID (
        txIDCB58: string,
    ): Promise<string> {
        const binTools = BinTools.getInstance();
        const decoded = binTools.cb58Decode(txIDCB58);
        return binTools.cb58Encode(decoded.slice(2, 34));
    };

    async broadcast(signedTransaction: SignedTransaction): Promise<AvalancheBroadcastResponse> {
        // https://docs.avax.network/apis/avalanchego/apis/p-chain#platformissuetx

        const endpoint = new URL("/ext/bc/P", signedTransaction.transaction.network.rpcUrl);
        const encodedPayload = signedTransaction.payload.toStringHex()

        const response = await jsonrpc<AvalancheBroadcastResponse>(endpoint, "platform.issueTx", {
            tx: encodedPayload,
            encoding: "hex",
        });

        return response;
    }

    async broadcastSimple(signedTransaction: SignedTransaction): Promise<string> {
        const response = await this.broadcast(signedTransaction);
        return response.txID;
    }
}
