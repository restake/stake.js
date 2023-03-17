import Web3 from "web3";
import { Account } from "web3-core";
import { AbiItem } from "web3-utils";
import { TransactionConfig } from "web3-core";
//import { SignedTransaction, Transaction } from "./EthereumTransaction.js";
import { SignedTransaction } from "./EthereumTransaction.js";
import { TransactionBroadcaster } from "../../network/broadcaster.js";
import { Transaction } from "@ethereumjs/tx";
//import CustomCommon from "ethereumjs-common";
import {Chain, Common, Hardfork}  from "@ethereumjs/common";


//const web3 = new Web3("HTTP://127.0.0.1:7545");


export type EthereumBroadcastResponse = {
    txID: string;
};

//export async function stake(account: Account, validatorPublicKey: string, amount: number) {

export async function transfer(PrivateKey: string, receiveAddress: string, amount: number, senderAddress: string){

    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const privateKey = Buffer.from(PrivateKey, 'hex');
    const gasPrice = await web3.eth.getGasPrice();
    const block = await web3.eth.getBlock("latest");
    const nonce = await web3.eth.getTransactionCount(senderAddress);
    const value = web3.utils.toWei(amount.toString(), "ether");
    const chainId = await web3.eth.getChainId();

    const chainParams = {
        name: 'testnetwork',
        networkId: chainId,
        chainId: chainId,
        url: "HTTP://127.0.0.1:7545",
        comment: "Test Local Chain"
    };

    const customCommon = Common.custom(chainParams);

    const txParams = {
        nonce: web3.utils.toHex(nonce),
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(block.gasLimit),
        to: receiveAddress,
        value: web3.utils.toHex(value),
    }

    const tx = Transaction.fromTxData(txParams, { common: customCommon });
    // tx signing should be done with noble/curves (secp256k1)

    const signedTx = tx.sign(privateKey);
    console.log(tx);
    console.log("NEW LINE \n \n");
    console.log(signedTx);
    const serializedTx = signedTx.serialize();

    const receipt = await web3.eth.sendSignedTransaction("0x" + serializedTx.toString("hex"));

    console.log(`Transaction successful. Transaction hash: ${receipt.transactionHash}`);
};

export class EthereumProtocol implements TransactionBroadcaster<SignedTransaction, EthereumBroadcastResponse> {
    static INSTANCE = new EthereumProtocol();

    private constructor() {
        // no-op
    }


    /*
    async stake(
        signer: EthereumSigner,
        account: Account,
        validatorPublicKey: string,
        amount: number,
    ): Promise<Transaction> {
        const chainId = await web3.eth.getChainId();

        const chainId2 = await web3.eth.signTransaction();

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
    */

    async broadcast(signedTransaction: SignedTransaction): Promise<EthereumBroadcastResponse> {
        throw new Error("");
    }

    async broadcastSimple(signedTransaction: SignedTransaction): Promise<string> {
        throw new Error("");
    }



}
