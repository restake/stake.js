import { NEARStakingProtocol } from "../interfaces/index.js";
import { NetworkConfig, isNamedNetworkConfig, isRawRPCNetworkConfig } from "../../service/network.js";
import { Wallet } from "../../index.js";

import { NEARNetwork, NEARProtocol, NEARSigner, networks } from "../../core/protocol/near/index.js";
import { Transaction } from "../../core/protocol/near/NEARTransaction.js";

export default class NEARStakingProvider implements NEARStakingProtocol {
    #networkConfig: NetworkConfig;
    #signers: WeakMap<Wallet, NEARSigner>;

    constructor(networkConfig: NetworkConfig) {
        this.#networkConfig = networkConfig;
        this.#signers = new WeakMap();
    }

    async init(): Promise<void> {
        return;
    }

    async stake(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: BigInt,
    ): Promise<string> {
        const signer = this.getSigner(wallet);
        return this.signAndBroadcast(signer, NEARProtocol.INSTANCE.createStakeTransaction(signer, stakingPoolAccountId, amount, "all"));
    }

    unstake(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: BigInt | "all",
    ): Promise<string> {
        const signer = this.getSigner(wallet);
        return this.signAndBroadcast(signer, NEARProtocol.INSTANCE.createUnstakeTransaction(signer, stakingPoolAccountId, amount));
    }

    withdraw(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: BigInt | "all",
    ): Promise<string> {
        const signer = this.getSigner(wallet);
        return this.signAndBroadcast(signer, NEARProtocol.INSTANCE.createWithdrawTransaction(signer, stakingPoolAccountId, amount));
    }

    private getNetwork(): NEARNetwork {
        const providedConfig = this.#networkConfig.near;
        const network: NEARNetwork = {
            id: "custom",
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
            network.rpcUrl = foundNetwork.rpcUrl;
        } else {
            // Default to mainnet
            network.id = networks["mainnet"].id;
            network.rpcUrl = networks["mainnet"].rpcUrl;
        }

        return network;
    }

    private getSigner(wallet: Wallet): NEARSigner {
        let signer = this.#signers.get(wallet);
        if (!signer) {
            const network = this.getNetwork();
            //signer = new NEARSigner(null, null, network);
            //this.#signers.set(wallet, signer);
            throw new Error("not implemented");
        }
        return signer;
    }

    private signAndBroadcast(signer: NEARSigner, transactionPromise: Promise<Transaction>): Promise<string> {
        return transactionPromise
            .then((rawTx) => signer.signTransaction(rawTx))
            .then((signedTx) => NEARProtocol.INSTANCE.broadcastSimple(signedTx));
    }
}
