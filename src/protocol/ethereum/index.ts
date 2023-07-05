import { EthereumStakingProtocol } from "../interfaces/index.ts";
import { NetworkConfig, Wallet, isNamedNetworkConfig, isRawRPCNetworkConfig, isSignerWallet } from "../../index.ts";
import { EthereumSigner } from "../../core/protocol/ethereum/EthereumSigner.ts";
import { EthereumProtocol } from "../../core/protocol/ethereum/EthereumProtocol.ts";
import { wrapSignerWallet } from "../../wallet/wrap.ts";
import { secp256k1Signer } from "../../core/signer/index.ts";
import { EthereumNetwork, networks } from "../../core/protocol/ethereum/network.ts";

type DepositData = {
    pubkey: string;
    withdrawal_credentials: string;
    amount: string;
    signature: string;
    deposit_message_root: string;
    deposit_data_root: string;
    fork_version: string;
    network_name: string;
};

export default class EthereumStakingProvider implements EthereumStakingProtocol {
    __networkConfig: NetworkConfig;
    __signers: WeakMap<Wallet, EthereumSigner>;
    __protocolID = "ethereum";

    constructor(networkConfig: NetworkConfig) {
        this.__networkConfig = networkConfig;
        this.__signers = new WeakMap();
    }

    async init(): Promise<void> {
        return;
    }

    async stake(wallet: Wallet, depositData: string): Promise<string[]> {
        const signer: EthereumSigner = await this.getSigner(wallet);
        const parsedDepositData = JSON.parse(depositData) as DepositData[];

        const txIds: string[] = [];
        for (const data of parsedDepositData) {
            const tx = await EthereumProtocol.INSTANCE.createStakeTransaction(
                signer,
                data.pubkey,
                BigInt(data.amount),
                data.withdrawal_credentials,
                data.signature,
                data.deposit_data_root,
            );

            const stx = await signer.signTransaction(tx);
            const txId = await EthereumProtocol.INSTANCE.broadcastSimple(stx);
            txIds.push(txId);
        }

        return txIds;
    }

    private getNetwork(): EthereumNetwork {
        const providedConfig = this.__networkConfig.ethereum;
        const network: EthereumNetwork = {
            id: "custom",
            chainId: 1337,
            rpcUrl: "",
        };

        if (isRawRPCNetworkConfig(providedConfig)) {
            network.rpcUrl = providedConfig.rpcEndpoint;
        } else if (isNamedNetworkConfig(providedConfig)) {
            const name = providedConfig.networkName;
            const foundNetwork = networks[name];
            if (!foundNetwork) {
                throw new Error(`Unknown predefined network '${name}', specify rpcEndpoint instead`);
            }

            network.id = foundNetwork.id;
            network.chainId = foundNetwork.chainId;
            network.rpcUrl = foundNetwork.rpcUrl;
            network.stakeDepositContractAddress = foundNetwork.stakeDepositContractAddress;
        } else {
            // Default to mainnet
            network.id = networks["mainnet"].id;
            network.chainId = networks["mainnet"].chainId;
            network.rpcUrl = networks["mainnet"].rpcUrl;
            network.stakeDepositContractAddress = networks["mainnet"].stakeDepositContractAddress;
        }

        return network;
    }

    private async getSigner(wallet: Wallet): Promise<EthereumSigner> {
        if (!isSignerWallet(wallet)) {
            throw new Error("Expected SignerWallet");
        }

        const network = this.getNetwork();
        const signerImpl = await wrapSignerWallet("secp256k1", this.__protocolID, wallet) as secp256k1Signer;

        return new EthereumSigner(signerImpl, network);
    }
}
