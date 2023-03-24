import { jsonrpc } from "../../utils/http.js";
import { EthereumSigner } from "./EthereumSigner.js";
import { SignedTransaction, Transaction } from "./EthereumTransaction.js";
import { TransactionBroadcaster } from "../../network/broadcaster.js";
import { Transaction as EthTransaction } from "@ethereumjs/tx";
import { Common }  from "@ethereumjs/common";
import { encode as b64Encode, decode as b64Decode } from "../../utils/base64.js";
import { ethers } from "ethers";
import { Contract } from "ethers";


export type EthereumBroadcastResponse = string;

export class EthereumProtocol implements TransactionBroadcaster<SignedTransaction, EthereumBroadcastResponse> {
    static INSTANCE = new EthereumProtocol();

    private constructor() {
        // no-op
    }

    async transfer(
        signer: EthereumSigner,
        receiveAddress: string,
        amount: BigInt,
    ): Promise<Transaction>{
        const senderAddress = await signer.getAddress();
        const gasPrice = await signer.fetchGasPrice();
        const block = await signer.fetchBlockHash("latest");
        const nonce = await signer.fetchNonce(senderAddress);
        const chainId = signer.network.chainId;

        const chainParams = {
            name: 'testnetwork',
            networkId: chainId,
            chainId: chainId,
            url: signer.network.rpcUrl,
            comment: "Test Local Chain"
        };

        const customCommon = Common.custom(chainParams);

        const txParams = {
            nonce: "0x" + nonce.toString(16),
            gasPrice: "0x" + gasPrice.toString(16),
            gasLimit: block.gasLimit,
            to: receiveAddress,
            value: "0x" + amount.toString(16),
        }

        const payload = EthTransaction.fromTxData(txParams, { common: customCommon });

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
    ): Promise<Transaction> {
        const senderAddress = await signer.getAddress();
        const gasPrice = await signer.fetchGasPrice();
        const block = await signer.fetchBlockHash("latest");
        const nonce = await signer.fetchNonce(senderAddress);
        const chainId = signer.network.chainId;
        const ethProvider = new ethers.providers.JsonRpcProvider(signer.network.rpcUrl);

        const chainParams = {
            name: signer.network.id,
            networkId: chainId,
            chainId: chainId,
            url: signer.network.rpcUrl,
        };

        const customCommon = Common.custom(chainParams);

        const depositAbi = [
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
        ];

        const contractAddress = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
        const contract = new Contract(contractAddress, depositAbi, ethProvider);
        const data_root_value = "dataroot" // WHAT IS THIS

        const txParams = {
            nonce: "0x" + nonce.toString(16),
            gasPrice: "0x" + gasPrice.toString(16),
            gasLimit: block.gasLimit,
            to: contractAddress,
            value: amount.toString(16),
            data: contract.interface.encodeFunctionData(
            "deposit",
            [
                validatorPublickey,
                withdrawalCredentials,
                validatorSignature,
                data_root_value, // WHAT IS THIS
            ]
            )
        };

        const payload = EthTransaction.fromTxData(txParams, { common: customCommon });

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
