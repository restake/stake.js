import { Interface, JsonRpcProvider } from "ethers";
import { TransactionEngine, PROTOCOL, Ethereum, SignerWallet } from "@restake/stakejs-core";
import {
    ETHEREUM_DEFAULT_RPC_URLS,
    ETHEREUM_DEPOSIT_CONTRACT_ABI,
    ETHEREUM_DEPOSIT_CONTRACT_ADDRESS,
    ETHEREUM_NETWORK_CHAIN_IDS,
} from "./constants.js";
import {
    EthereumNetwork,
    EthereumNetworkConfig,
    EthereumRawTransaction,
    EthereumSignedTransaction,
    EthereumDepositData,
} from "./types.ts";

export class EthereumTransactionEngine implements TransactionEngine<Ethereum> {
    rpcUrl: URL;
    networkConfig: EthereumNetworkConfig;

    constructor(network: EthereumNetwork = { name: "mainnet" }, rpcUrl?: URL) {
        this.networkConfig = { protocol: PROTOCOL.ETHEREUM, network: network };
        this.rpcUrl = rpcUrl || ETHEREUM_DEFAULT_RPC_URLS[network.name];
    }

    private async fetchGasLimitEstimate(to: string, data: string): Promise<bigint> {

        const response = await fetch(this.rpcUrl.toString(), {
            method: "POST",
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "eth_estimateGas",
                params: [{ to, data }],
            }),
        });

        const jsonResponse = await response.json();

        return BigInt(jsonResponse.result);
    }

    private encodeDepositData(depositData: EthereumDepositData): string {
        const iface = new Interface(ETHEREUM_DEPOSIT_CONTRACT_ABI);

        const encodedData = iface.encodeFunctionData("deposit", [
            "0x" + depositData.pubkey,
            "0x" + depositData.withdrawal_credentials,
            "0x" + depositData.signature,
            "0x" + depositData.deposit_data_root,
        ]);

        return encodedData;
    }

    async buildStakeTx(wallet: SignerWallet, depositData: EthereumDepositData, selector?: string): Promise<EthereumRawTransaction> {
        const jsonRpcProvider = new JsonRpcProvider(this.rpcUrl.toString());
        const nonce = await jsonRpcProvider.getTransactionCount(wallet.getAddress(this.networkConfig), selector);
        const feeData = await jsonRpcProvider.getFeeData();
        const to = ETHEREUM_DEPOSIT_CONTRACT_ADDRESS[this.networkConfig.network.name];
        const data = this.encodeDepositData(depositData);
        // Amount in depositData is in gwei
        const value = depositData.amount * 10n ** 9n;

        const gasLimitEstimate = await this.fetchGasLimitEstimate(to, data);
        const maxPriorityFeePerGas = feeData["maxPriorityFeePerGas"];
        const maxFeePerGas = feeData["maxFeePerGas"];

        const rawTx = new EthereumRawTransaction({
            type: 2,
            nonce,
            to,
            data,
            value,
            gasLimit: gasLimitEstimate,
            maxPriorityFeePerGas,
            maxFeePerGas,
            chainId: ETHEREUM_NETWORK_CHAIN_IDS[this.networkConfig.network.name],
        });

        return rawTx;
    }

    async sign(wallet: SignerWallet, rawTx: EthereumRawTransaction, selector?: string | undefined): Promise<EthereumSignedTransaction> {
        const signature = await wallet.sign(rawTx, this.networkConfig, selector);
        const signedTx = new EthereumSignedTransaction(rawTx.transaction, signature);

        return signedTx;
    }

    async broadcast(signedTx: EthereumSignedTransaction): Promise<string> {
        const jsonRpcProvider = new JsonRpcProvider(this.rpcUrl.toString());
        const response = await jsonRpcProvider.broadcastTransaction(signedTx.transaction.serialized);

        return response.hash;
    }
}
