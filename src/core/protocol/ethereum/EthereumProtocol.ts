import { jsonrpc } from "../../utils/http.js";
import { EthereumBlockResponse, EthereumSigner } from "./EthereumSigner.js";
import { SignedTransaction, Transaction } from "./EthereumTransaction.js";
import { TransactionBroadcaster } from "../../network/broadcaster.js";
import { Transaction as EthTransaction } from "@ethereumjs/tx";
import { Common }  from "@ethereumjs/common";
import { ethers } from "ethers";
import { Contract } from "ethers";
import { BlockFinality } from "./network.js";

export type EthereumBroadcastResponse = string;

export class EthereumProtocol implements TransactionBroadcaster<SignedTransaction, EthereumBroadcastResponse> {
    static INSTANCE = new EthereumProtocol();

    private constructor() {
        // no-op
    }

    private async fetchParameters(
        signer: EthereumSigner,
        block: BlockFinality | BigInt,
    ): Promise<{ ethBlock: EthereumBlockResponse, gasPrice: BigInt, nonce: BigInt }> {
        const senderAddress = signer.getAddress();
        const [ ethBlock, gasPrice ] = await Promise.all([ signer.fetchBlock(block), signer.fetchGasPrice() ]);
        const nonce = await signer.fetchNonce(senderAddress, typeof block === "bigint" ? block : BigInt(ethBlock.number));

        return {
            ethBlock,
            gasPrice,
            nonce
        };
    }

    async transfer(
        signer: EthereumSigner,
        receiveAddress: string,
        amount: BigInt,
        block: BlockFinality | BigInt = "latest",
    ): Promise<Transaction>{
        const chainId = signer.network.chainId;
        const { ethBlock, gasPrice, nonce } = await this.fetchParameters(signer, block);

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
            gasLimit: ethBlock.gasLimit,
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
        depositDataRoot: string,
        block: BlockFinality | BigInt = "latest",
    ): Promise<Transaction> {
        const chainId = signer.network.chainId;
        const { ethBlock, gasPrice, nonce } = await this.fetchParameters(signer, block);

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

        const contractAddress = "0x7479Fc54515ef6Ef1C649d54e91520F51ff77982";
        const contract = new Contract(contractAddress, depositAbi, ethProvider);

        const validatorPublickeyBytes = Buffer.from(validatorPublickey.replace(/^0x/, ""), "hex");
        const withdrawalCredentialsBytes = Buffer.from(withdrawalCredentials.replace(/^0x/, ""), "hex");
        const validatorSignatureBytes = Buffer.from(validatorSignature.replace(/^0x/, ""), "hex");
        const depositDataRootBytes32 = ethers.utils.hexZeroPad(depositDataRoot, 32);

        const txParams = {
            nonce: "0x" + nonce.toString(16),
            gasPrice: "0x" + gasPrice.toString(16),
            gasLimit: ethBlock.gasLimit,
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
