import Web3 from "web3";
import { Account } from "web3-core";
import { AbiItem } from "web3-utils";
import { SignedTransaction, Transaction } from "./EthereumTransaction.js";
import { TransactionBroadcaster } from "../../network/broadcaster.js";


const web3 = new Web3("HTTP://127.0.0.1:7545");

export type EthereumBroadcastResponse = {
    txID: string;
};

//export async function stake(account: Account, validatorPublicKey: string, amount: number) {

export class EthereumProtocol implements TransactionBroadcaster<SignedTransaction, EthereumBroadcastResponse> {
    static INSTANCE = new EthereumProtocol();

    private constructor() {
        // no-op
    }

    async stake(
        signer: EthereumSigner,
        account: Account,
        validatorPublicKey: string,
        amount: number,
    ): Promise<Transaction> {
        const chainId = await web3.eth.getChainId();

        const gasPrice = await web3.eth.getGasPrice();

        const contractAddress = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
        const myContractAbi: AbiItem[] = [
            {
            inputs: [
                {
                internalType: "address",
                name: "token",
                type: "address"
                }
            ],
            name: "deposit",
            outputs: [
                {
                internalType: "uint256",
                name: "",
                type: "uint256"
                }
            ],
            stateMutability: "payable",
            type: "function"
            }
        ];

        const contract = new web3.eth.Contract(myContractAbi, contractAddress);

        const tx = {
            from: account.address,
            to: contractAddress,
            value: web3.utils.toWei(amount.toString(), "ether"),
            data: contract.methods.deposit(validatorPublicKey).encodeABI(),
            chainId,
            gasPrice,
            gas: 200000
        };

        return {
            payload: tx,
            network: signer.network,
        };
    };

    async broadcast(signedTransaction: SignedTransaction): Promise<EthereumBroadcastResponse> {
        throw new Error("");
    }

    async broadcastSimple(signedTransaction: SignedTransaction): Promise<string> {
        throw new Error("");
    }
}
