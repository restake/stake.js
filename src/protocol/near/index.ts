import { NEARStakingProtocol } from "../interfaces/index.ts";
import { NetworkConfig, isNamedNetworkConfig, isRawRPCNetworkConfig } from "../../service/network.ts";
import { Wallet, isSignerWallet } from "../../index.ts";

import { NEARNetwork, NEARProtocol, NEARSigner, networks } from "../../core/protocol/near/index.ts";
import { Transaction } from "../../core/protocol/near/NEARTransaction.ts";
import { parseNearAmount } from "near-api-js/lib/utils/format.ts";
import { wrapSignerWallet } from "../../wallet/wrap.ts";

export default class NEARStakingProvider implements NEARStakingProtocol {
    __networkConfig: NetworkConfig;
    __protocolID = "near";

    constructor(networkConfig: NetworkConfig) {
        this.__networkConfig = networkConfig;
    }

    async init(): Promise<void> {
        return;
    }

    async stake(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: string,
    ): Promise<string> {
        const signer = await this.getSigner(wallet);
        const yAmount = this.normalizeAmount(amount, []);

        return this.signAndBroadcast(signer, NEARProtocol.INSTANCE.createStakeTransaction(signer, stakingPoolAccountId, yAmount, "all"));
    }

    async unstake(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: string | "all",
    ): Promise<string> {
        const signer = await this.getSigner(wallet);
        const yAmount = this.normalizeAmount(amount, ["all"]);

        return this.signAndBroadcast(signer, NEARProtocol.INSTANCE.createUnstakeTransaction(signer, stakingPoolAccountId, yAmount));
    }

    async withdraw(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: string | "all",
    ): Promise<string> {
        const signer = await this.getSigner(wallet);
        const yAmount = this.normalizeAmount(amount, ["all"]);

        return this.signAndBroadcast(signer, NEARProtocol.INSTANCE.createWithdrawTransaction(signer, stakingPoolAccountId, yAmount));
    }

    private getNetwork(): NEARNetwork {
        const providedConfig = this.__networkConfig.near;
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

    private normalizeAmount<T extends string>(
        amount: string,
        passthroughValues: T[],
    ): bigint | T {
        if (typeof amount === "bigint") {
            return amount;
        }

        if (passthroughValues.includes(amount as T)) {
            return amount as T;
        }

        const parsed = parseNearAmount(amount);
        if (!parsed) {
            throw new Error(`Unable to parse NEAR amount: "${amount}"`);
        }

        return BigInt(parsed);
    }

    private async getSigner(wallet: Wallet): Promise<NEARSigner> {
        if (!isSignerWallet(wallet)) {
            throw new Error("Expected SignerWallet");
        }

        const network = this.getNetwork();
        const accountId = await wallet.accountId(this.__protocolID);
        const signerImpl = await wrapSignerWallet("ed25519", this.__protocolID, wallet);

        return new NEARSigner(signerImpl, accountId, network);
    }

    private signAndBroadcast(signer: NEARSigner, transactionPromise: Promise<Transaction>): Promise<string> {
        return transactionPromise
            .then((rawTx) => signer.signTransaction(rawTx))
            .then((signedTx) => NEARProtocol.INSTANCE.broadcastSimple(signedTx));
    }
}
