import { BlockFinality } from "./network.ts";
import { EthereumSigner } from "./EthereumSigner.ts";
import { jsonrpc } from "../../utils/http.ts";
import { SignedTransaction, Transaction } from "./EthereumTransaction.ts";
import { TransactionBroadcaster } from "../../network/broadcaster.ts";

import { Common } from "@ethereumjs/common";
import { Contract, ethers } from "ethers";
import { hexToBytes } from "@noble/curves/abstract/utils";
import { FeeMarketEIP1559Transaction as EthTransaction, FeeMarketEIP1559TxData } from "@ethereumjs/tx";

export type EthereumBroadcastResponse = string;

const depositContractAbi = [
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "pubkey",
                "type": "bytes",
            },
            {
                "internalType": "bytes",
                "name": "withdrawal_credentials",
                "type": "bytes",
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes",
            },
            {
                "internalType": "bytes32",
                "name": "data_root_value",
                "type": "bytes32",
            },
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
] as const;

// TODO: better name
type Parameters = {
    baseFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    nonce: bigint;
};

type PartialTransaction = {
    to: string;
    value: string;
    data?: string;
};

export class EthereumProtocol implements TransactionBroadcaster<SignedTransaction, EthereumBroadcastResponse> {
    static INSTANCE = new EthereumProtocol();

    private constructor() {
        // No-op
    }

    // TODO: better name
    private async fetchParameters(
        signer: EthereumSigner,
        block: BlockFinality | bigint,
    ): Promise<Parameters> {
        const senderAddress = signer.getAddress();
        const [ethBlock, baseFeePerGas, maxPriorityFeePerGas] = await Promise.all([
            signer.fetchBlock(block),
            this.feeHistory(signer.network.rpcUrl, 1, block),
            this.maxPriorityFeePerGas(signer.network.rpcUrl), // TODO: move to signer
        ]);
        const nonce = await signer.fetchNonce(senderAddress, typeof block === "bigint" ? block : BigInt(ethBlock.number));

        return {
            baseFeePerGas,
            maxPriorityFeePerGas,
            nonce,
        };
    }

    private async estimateGas(
        endpoint: string,
        transaction: PartialTransaction,
    ): Promise<bigint> {
        const { to, value, data } = transaction;
        const estimatedGas = await jsonrpc<string>(endpoint, "eth_estimateGas", [
            {
                to,
                value,
                data,
            },
        ]);

        return BigInt(estimatedGas);
    }

    // Returns baseFeePerGas
    private async feeHistory(
        endpoint: string,
        blockCount: number,
        newestBlock: BlockFinality | bigint,
    ): Promise<bigint> {
        const feeHistory = await jsonrpc<{ baseFeePerGas: string }>(endpoint, "eth_feeHistory", [
            blockCount,
            newestBlock.toString(),
            [ 25, 75 ],
        ]);

        const history = feeHistory.baseFeePerGas;

        return BigInt(history[1] ?? history[0]);
    }

    private async maxPriorityFeePerGas(endpoint: string): Promise<bigint> {
        const maxPriorityFeePerGas = await jsonrpc<string>(endpoint, "eth_maxPriorityFeePerGas", []);

        return BigInt(maxPriorityFeePerGas);
    }

    private constructTxData(parameters: Parameters, gasLimit?: bigint): FeeMarketEIP1559TxData {
        const { baseFeePerGas, maxPriorityFeePerGas, nonce } = parameters;
        const maxFeePerGas = (baseFeePerGas * 2n) + maxPriorityFeePerGas;

        // TODO: move this constant
        const baseGasLimit = 21000;

        return {
            nonce: "0x" + nonce.toString(16),
            maxPriorityFeePerGas,
            maxFeePerGas,
            gasPrice: null,
            gasLimit: gasLimit ?? baseGasLimit,
        };
    }

    private constructTransaction(signer: EthereumSigner, txData: FeeMarketEIP1559TxData): EthTransaction {
        return EthTransaction.fromTxData(txData, {
            common: Common.custom({
                name: signer.network.id,
                networkId: signer.network.chainId,
                chainId: signer.network.chainId,
                url: signer.network.rpcUrl,
            }),
        });
    }

    async createTransferTransaction(
        signer: EthereumSigner,
        receiveAddress: string,
        amount: bigint,
        block: BlockFinality | bigint = "latest",
    ): Promise<Transaction> {
        const parameters = await this.fetchParameters(signer, block);

        const tx: PartialTransaction = {
            to: receiveAddress,
            value: "0x" + amount.toString(16),
        };

        const estimatedGasLimit = await this.estimateGas(signer.network.rpcUrl, tx);
        const payload = this.constructTransaction(signer, {
            ...this.constructTxData(parameters, estimatedGasLimit),
            ...tx,
        });

        return {
            payload,
            network: signer.network,
        };
    }

    async createStakeTransaction(
        signer: EthereumSigner,
        validatorPublickey: string,
        amount: bigint,
        withdrawalCredentials: string,
        validatorSignature: string,
        depositDataRoot: string,
        block: BlockFinality | bigint = "latest",
    ): Promise<Transaction> {
        const contractAddress = signer.network.stakeDepositContractAddress;
        if (!contractAddress) {
            const { id, chainId } = signer.network;
            throw new Error(
                `Network info ("${id}" id=${chainId}) attached to current signer does not have stake deposit contract address`,
            );
        }

        const parameters = await this.fetchParameters(signer, block);

        const ethProvider = new ethers.JsonRpcProvider(signer.network.rpcUrl);

        const contract = new Contract(contractAddress, depositContractAbi, ethProvider);

        const validatorPublickeyBytes = hexToBytes(validatorPublickey.replace(/^0x/, ""));
        const withdrawalCredentialsBytes = hexToBytes(withdrawalCredentials.replace(/^0x/, ""));
        const validatorSignatureBytes = hexToBytes(validatorSignature.replace(/^0x/, ""));
        const depositDataRootBytes32 = ethers.zeroPadValue(depositDataRoot, 32);

        const tx: PartialTransaction = {
            to: contractAddress,
            value: "0x" + amount.toString(16),
            data: contract.interface.encodeFunctionData(
                "deposit",
                [
                    validatorPublickeyBytes,
                    withdrawalCredentialsBytes,
                    validatorSignatureBytes,
                    depositDataRootBytes32,
                ],
            ),
        };

        const estimatedGasLimit = await this.estimateGas(signer.network.rpcUrl, tx);
        const payload = this.constructTransaction(signer, {
            ...this.constructTxData(parameters, estimatedGasLimit),
            ...tx,
        });

        return {
            payload,
            network: signer.network,
        };
    }

    /**
     * Broadcast the transaction using sendRawTransaction JSON-RPC method.
     * For more information: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction
     *
     * @param signedTransaction
     * @returns EthereumBroadcastResponse
     */
    async broadcast(signedTransaction: SignedTransaction): Promise<EthereumBroadcastResponse> {
        const endpoint = new URL(signedTransaction.transaction.network.rpcUrl);
        const serializedTx = signedTransaction.payload.serialize();

        const response = await jsonrpc<EthereumBroadcastResponse>(endpoint, "eth_sendRawTransaction", [
            "0x" + serializedTx.toString("hex"),
        ]);

        return response;
    }

    async broadcastSimple(signedTransaction: SignedTransaction): Promise<string> {
        const response = await this.broadcast(signedTransaction);

        return response;
    }
}
