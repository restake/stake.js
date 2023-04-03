import { NEARStakingProtocol } from "../interfaces/index.js";
import { NetworkConfig, isNamedNetworkConfig, isRawRPCNetworkConfig } from "../../service/network.js";
import { Wallet } from "../../index.js";

import { NEARNetwork, NEARProtocol, NEARSigner, networks } from "../../core/protocol/near/index.js";
import { Transaction } from "../../core/protocol/near/NEARTransaction.js";
import FilesystemWallet from "../../wallet/filesystem/index.js";
import { ed25519PublicKey, ed25519Signer } from "../../core/signer/ed25519Signer.js";

export default class NEARStakingProvider implements NEARStakingProtocol {
    #networkConfig: NetworkConfig;
    #signers: WeakMap<Wallet, NEARSigner>;
    #protocolID = "near";

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
        const signer = await this.getSigner(wallet);
        return this.signAndBroadcast(signer, NEARProtocol.INSTANCE.createStakeTransaction(signer, stakingPoolAccountId, amount, "all"));
    }

    async unstake(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: BigInt | "all",
    ): Promise<string> {
        const signer = await this.getSigner(wallet);
        return this.signAndBroadcast(signer, NEARProtocol.INSTANCE.createUnstakeTransaction(signer, stakingPoolAccountId, amount));
    }

    async withdraw(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: BigInt | "all",
    ): Promise<string> {
        const signer = await this.getSigner(wallet);
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

    private _fsw(wallet: Wallet): FilesystemWallet {
        if (!(wallet instanceof FilesystemWallet)) {
            throw new Error("Not FilesystemWallet");
        }
        return wallet as FilesystemWallet;
    }

    private async getSigner(wallet: Wallet): Promise<NEARSigner> {
        let signer = this.#signers.get(wallet);
        if (!signer) {
            const network = this.getNetwork();
            const fsw = this._fsw(wallet);

            const [ accountId, rawPublicKey ] = await Promise.all([
                fsw.accountId(this.#protocolID),
                fsw.publicKey(this.#protocolID),
            ]);

            const publicKey = new ed25519PublicKey(rawPublicKey);
            const signerImpl = new DelegatingEd25519Signer(publicKey, (payload) => {
                return fsw.sign(this.#protocolID, payload);
            });

            signer = new NEARSigner(signerImpl, accountId, network);
            this.#signers.set(wallet, signer);
        }
        return signer;
    }

    private signAndBroadcast(signer: NEARSigner, transactionPromise: Promise<Transaction>): Promise<string> {
        return transactionPromise
            .then((rawTx) => signer.signTransaction(rawTx))
            .then((signedTx) => NEARProtocol.INSTANCE.broadcastSimple(signedTx));
    }
}

type SignFn = (payload: Uint8Array) => Promise<Uint8Array>;

class DelegatingEd25519Signer implements ed25519Signer {
    readonly keyType = "ed25519";
    #publicKey: ed25519PublicKey;
    #signFn: SignFn;

    constructor(
        publicKey: ed25519PublicKey,
        signFn: SignFn,
    ) {
        this.#publicKey = publicKey;
        this.#signFn = signFn;
    }

    async sign(payload: Uint8Array): Promise<Uint8Array> {
        return this.#signFn(payload);
    }

    verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    get publicKey(): ed25519PublicKey {
        return this.#publicKey;
    }
}
