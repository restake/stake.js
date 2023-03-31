import { BlockFinality } from "./network.js";
import { EthereumBlockResponse, EthereumSigner } from "./EthereumSigner.js";
import { jsonrpc } from "../../utils/http.js";
import { SignedTransaction, Transaction } from "./EthereumTransaction.js";
import { TransactionBroadcaster } from "../../network/broadcaster.js";

import { Common }  from "@ethereumjs/common";
import { ethers, Contract } from "ethers";
import { hexToBytes } from "@noble/curves/abstract/utils";
import { Transaction as EthTransaction, TxData } from "@ethereumjs/tx";

export type EthereumBroadcastResponse = string;

const depositContractAbi = [
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "pubkey",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "withdrawal_credentials",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            },
            {
                "internalType": "bytes32",
                "name": "data_root_value",
                "type": "bytes32"
            }
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// TODO: better name
type Parameters = {
    ethBlock: EthereumBlockResponse;
    gasPrice: BigInt;
    nonce: BigInt;
};

export class EthereumProtocol implements TransactionBroadcaster<SignedTransaction, EthereumBroadcastResponse> {
    static INSTANCE = new EthereumProtocol();

    private constructor() {
        // no-op
    }

    // TODO: better name
    private async fetchParameters(
        signer: EthereumSigner,
        block: BlockFinality | BigInt,
    ): Promise<Parameters> {
        const senderAddress = signer.getAddress();
        const [ ethBlock, gasPrice ] = await Promise.all([ signer.fetchBlock(block), signer.fetchGasPrice() ]);
        const nonce = await signer.fetchNonce(senderAddress, typeof block === "bigint" ? block : BigInt(ethBlock.number));

        return {
            ethBlock,
            gasPrice,
            nonce
        };
    }

    private constructTxData(parameters: Parameters): TxData {
        const { ethBlock, gasPrice, nonce } = parameters;

        return {
            nonce: "0x" + nonce.toString(16),
            gasPrice: "0x" + gasPrice.toString(16),
            gasLimit: ethBlock.gasLimit,
        };
    }

    private constructTransaction(signer: EthereumSigner, txData: TxData): EthTransaction {
        return EthTransaction.fromTxData(txData, {
            common: Common.custom({
                name: signer.network.id,
                networkId: signer.network.chainId,
                chainId: signer.network.chainId,
                url: signer.network.rpcUrl,
            }),
        });
    }

    async transfer(
        signer: EthereumSigner,
        receiveAddress: string,
        amount: BigInt,
        block: BlockFinality | BigInt = "latest",
    ): Promise<Transaction>{
        const parameters = await this.fetchParameters(signer, block);

        const payload = this.constructTransaction(signer, {
            ...this.constructTxData(parameters),
            to: receiveAddress,
            value: "0x" + amount.toString(16),
        });

        return {
            payload,
            network: signer.network,
        };
    };

    async stake(
        signer: EthereumSigner,
        validatorPublickey: string,
        amount: BigInt,
        withdrawalCredentials: string,
        validatorSignature: string,
        depositDataRoot: string,
        block: BlockFinality | BigInt = "latest",
    ): Promise<Transaction> {
        const parameters = await this.fetchParameters(signer, block)

        const ethProvider = new ethers.providers.JsonRpcProvider(signer.network.rpcUrl);

        const contractAddress = "0x7479Fc54515ef6Ef1C649d54e91520F51ff77982";
        const contract = new Contract(contractAddress, depositContractAbi, ethProvider);

        const validatorPublickeyBytes = hexToBytes(validatorPublickey.replace(/^0x/, ""));
        const withdrawalCredentialsBytes = hexToBytes(withdrawalCredentials.replace(/^0x/, ""));
        const validatorSignatureBytes = hexToBytes(validatorSignature.replace(/^0x/, ""));
        const depositDataRootBytes32 = ethers.utils.hexZeroPad(depositDataRoot, 32);

        const payload = this.constructTransaction(signer, {
            ...this.constructTxData(parameters),
            to: contractAddress,
            value: "0x" + amount.toString(16),
            data: contract.interface.encodeFunctionData(
                "deposit",
                [
                    validatorPublickeyBytes,
                    withdrawalCredentialsBytes,
                    validatorSignatureBytes,
                    depositDataRootBytes32,
                ]
            )
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
            "0x" + serializedTx.toString("hex")
        ]);

        return response;
    }

    async broadcastSimple(signedTransaction: SignedTransaction): Promise<string> {
        const response = await this.broadcast(signedTransaction);
        return response;
    }
}
