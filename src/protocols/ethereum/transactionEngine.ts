import { Interface, JsonRpcProvider, Transaction } from "ethers";
import { Ethereum, NetworkConfig, RawTransaction } from "..";
import { BaseTransactionEngine } from "../../transactions";
import { SignerWallet } from "../../wallets";
import { PROTOCOL } from "../constants";
import { DEFAULT_RPC_URLS, DEPOSIT_CONTRACT_ABI, DEPOSIT_CONTRACT_ADDRESS, ETHEREUM_NETWORK_CHAIN_IDS } from "./constants";
import { EthereumNetwork, EthereumSignedTransaction } from "./types";

type EthereumDepositData = {
    pubkey: string;
    withdrawal_credentials: string;
    amount: bigint;
    signature: string;
    deposit_message_root: string;
    deposit_data_root: string;
    fork_version: string;
    network_name: string;
};


export class EthereumTransactionEngine extends BaseTransactionEngine<Ethereum> {
    rpcUrl: URL;
    networkConfig: NetworkConfig<Ethereum>;

    constructor(network: EthereumNetwork = "mainnet", rpcUrl?: URL) {
        super();
        this.networkConfig = { protocol: PROTOCOL.ETHEREUM, network: network };
        this.rpcUrl = rpcUrl || DEFAULT_RPC_URLS[network];
    }

    private async fetchGasLimitEstimate(transaction: RawTransaction<Ethereum>): Promise<bigint> {
        const { to, value, data } = transaction;
        const response = await fetch(this.rpcUrl.toString(), {
            method: "POST",
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "eth_estimateGas",
                params: [{ to, value, data }],
            }),
        });

        const jsonResponse = await response.json();

        return BigInt(jsonResponse.result);
    }

    private encodeDepositData(depositData: EthereumDepositData): string {
        const iface = new Interface(DEPOSIT_CONTRACT_ABI);

        const encodedData = iface.encodeFunctionData("deposit", [
            depositData.pubkey,
            depositData.withdrawal_credentials,
            depositData.signature,
            depositData.deposit_data_root,
        ]);

        return encodedData;
    }

    // Amount in depositData is in gwei
    async buildStakeTx(wallet: SignerWallet, depositData: EthereumDepositData): Promise<RawTransaction<Ethereum>> {
        const jsonRpcProvider = new JsonRpcProvider(this.rpcUrl.toString());
        const nonce = await jsonRpcProvider.getTransactionCount(wallet.getAddress(this.networkConfig));
        const feeData = await jsonRpcProvider.getFeeData();
        const data = this.encodeDepositData(depositData);

        const partialRawTx: RawTransaction<Ethereum> = Transaction.from({
            type: 2,
            nonce: nonce,
            to: DEPOSIT_CONTRACT_ADDRESS[this.networkConfig.network],
            value: depositData.amount * (10n ** 9n),
            data: data,
        });

        const gasLimitEstimate = await this.fetchGasLimitEstimate(partialRawTx);
        const maxPriorityFeePerGas = feeData["maxPriorityFeePerGas"];
        const maxFeePerGas = feeData["maxFeePerGas"];

        const rawTx: RawTransaction<Ethereum> = Transaction.from({
            ...partialRawTx,
            gasLimit: gasLimitEstimate,
            maxPriorityFeePerGas,
            maxFeePerGas,
            chainId: ETHEREUM_NETWORK_CHAIN_IDS[this.networkConfig.network],
        });

        return rawTx;
    }

    async broadcast(signedTx: EthereumSignedTransaction): Promise<string> {
        const jsonRpcProvider = new JsonRpcProvider(this.rpcUrl.toString());
        const response = await jsonRpcProvider.broadcastTransaction(signedTx.serialized);

        return response.hash;
    }
}
