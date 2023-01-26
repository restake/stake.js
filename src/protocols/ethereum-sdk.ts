import { Transaction } from "@ethereumjs/tx";
import Web3 from "web3";
import { AbiItem } from 'web3-utils'
import { Protocol, Network } from "../types/global";
import { Wallet } from "../wallets/wallet";
import { ProtocolSDK } from "./protocol-sdk";

enum RPCendpoints {
    testnet = 'https://mainnet.infura.io/v3/dd3c1205a3ed408daaf9259dcf44cb94',
    mainnet = 'https://mainnet.infura.io/v3/dd3c1205a3ed408daaf9259dcf44cb94'
}

const STAKING_CONTRACT_ABI = '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes","name":"pubkey","type":"bytes"},{"indexed":false,"internalType":"bytes","name":"withdrawal_credentials","type":"bytes"},{"indexed":false,"internalType":"bytes","name":"amount","type":"bytes"},{"indexed":false,"internalType":"bytes","name":"signature","type":"bytes"},{"indexed":false,"internalType":"bytes","name":"index","type":"bytes"}],"name":"DepositEvent","type":"event"},{"inputs":[{"internalType":"bytes","name":"pubkey","type":"bytes"},{"internalType":"bytes","name":"withdrawal_credentials","type":"bytes"},{"internalType":"bytes","name":"signature","type":"bytes"},{"internalType":"bytes32","name":"deposit_data_root","type":"bytes32"}],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"get_deposit_count","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"get_deposit_root","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"}]'
const STAKING_CONTRACT_ADDRESSES: Map<Network, string> = new Map([
    ['testnet', ''],
    ['mainnet', '0x00000000219ab540356cBB839Cbe05303d7705Fa']
]);

export class Ethereum extends ProtocolSDK {
    web3: Web3;

    constructor(protocol: Protocol, wallet: Wallet) {
        super(protocol, wallet);
        this.web3 = new Web3(new Web3.providers.HttpProvider(RPCendpoints[wallet.network]));
    }

    async buildStakeTransaction(wallet: Wallet, vaultId: string, validator: string, depositData: DepositData): Promise<Transaction> {

        const depositContract = new this.web3.eth.Contract(
            JSON.parse(STAKING_CONTRACT_ABI) as AbiItem, 
            STAKING_CONTRACT_ADDRESSES.get(this.wallet.network)
        );

        const depositFunction = depositContract.methods.deposit(
            '0x' + depositData.pubkey,
            '0x' + depositData.withdrawalCredentials,
            '0x' + depositData.signature,
            '0x' + depositData.depositDataRoot
        );
        
        const walletAddress: string = await wallet.getAddress(this.protocol, this.wallet.network);
        const nonce = await this.web3.eth.getTransactionCount(walletAddress);
        const gas = 100000 + depositData.amount / 32 * 80000;
        
        const rawTx: Transaction = new Transaction({
            nonce: nonce,
            data: depositFunction.encodeABI(),
            to: walletAddress,
            value: this.web3.utils.numberToHex(0),
            gasPrice: this.web3.utils.numberToHex(gas),
            gasLimit: this.web3.utils.numberToHex(gas)
        }) 

        return rawTx;
    }

    signTransaction(wallet: Wallet, vaultId: string, rawTx: any) {
        
    }

    broadcastTransaction(signedTx: any): string {
        return 'xxx';
    }
}
