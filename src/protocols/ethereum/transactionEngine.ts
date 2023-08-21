import { Interface, JsonRpcProvider, Transaction } from "ethers";
import { Ethereum, NetworkConfig, RawTransaction } from "../index.ts";
import { BaseTransactionEngine } from "../../transactions/index.ts";
import { SignerWallet } from "../../wallets/index.ts";
import { PROTOCOL } from "../constants.ts";
import { DEFAULT_RPC_URLS, DEPOSIT_CONTRACT_ABI, DEPOSIT_CONTRACT_ADDRESS, ETHEREUM_NETWORK_CHAIN_IDS } from "./constants.ts";
import { EthereumNetwork, EthereumSignedTransaction, EthereumDepositData } from "./types.ts";

export class EthereumTransactionEngine extends BaseTransactionEngine<Ethereum> {
    rpcUrl: URL;
    networkConfig: NetworkConfig<Ethereum>;

    constructor(network: EthereumNetwork = "mainnet", rpcUrl?: URL) {
        super();
        this.networkConfig = { protocol: PROTOCOL.ETHEREUM, network: network };
        this.rpcUrl = rpcUrl || DEFAULT_RPC_URLS[network];
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
        const iface = new Interface(DEPOSIT_CONTRACT_ABI);

        const encodedData = iface.encodeFunctionData("deposit", [
            "0x" + depositData.pubkey,
            "0x" + depositData.withdrawal_credentials,
            "0x" + depositData.signature,
            "0x" + depositData.deposit_data_root,
        ]);

        return encodedData;
    }

    // Amount in depositData is in gwei
    async buildStakeTx(wallet: SignerWallet, depositData: EthereumDepositData): Promise<RawTransaction<Ethereum>> {
        const jsonRpcProvider = new JsonRpcProvider(this.rpcUrl.toString());
        const nonce = await jsonRpcProvider.getTransactionCount(wallet.getAddress(this.networkConfig));
        const feeData = await jsonRpcProvider.getFeeData();
        const to = DEPOSIT_CONTRACT_ADDRESS[this.networkConfig.network];
        const data = this.encodeDepositData(depositData);
        const value = depositData.amount;

        const gasLimitEstimate = await this.fetchGasLimitEstimate(to, data);
        const maxPriorityFeePerGas = feeData["maxPriorityFeePerGas"];
        const maxFeePerGas = feeData["maxFeePerGas"];

        const rawTx: RawTransaction<Ethereum> = Transaction.from({
            type: 2,
            nonce,
            to,
            data,
            value,
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
