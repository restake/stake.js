import { SignerWallet } from "../wallets/index.ts";
import { Protocol, RawTransaction, SignedTransaction, NetworkConfig, Ethereum, NearProtocol } from "../protocols/index.ts";
import LedgerTransport from "@ledgerhq/hw-transport-node-hid";
import EthereumLedgerApp, { ledgerService as ethereumLegerService } from "@ledgerhq/hw-app-eth";
import NearLedgerApp from "@ledgerhq/hw-app-near";
import { PROTOCOL } from "../protocols/constants.ts";
import { Transaction } from "ethers";
import * as nearApi from "near-api-js";

type LedgerApp = EthereumLedgerApp.default | NearLedgerApp.default;

const appMapping = {
    [PROTOCOL.ETHEREUM]: EthereumLedgerApp.default,
    [PROTOCOL.NEAR_PROTOCOL]: NearLedgerApp.default,
};

const pathMapping = {
    [PROTOCOL.ETHEREUM]: "44'/60'/0'/0/0",
    [PROTOCOL.NEAR_PROTOCOL]: "44'/397'/0'/0'/0'",
};

export class LedgerWallet implements SignerWallet {

    app?: LedgerApp;

    private async getApp(network: NetworkConfig<Protocol>): Promise<LedgerApp> {
        if (!this.app) {
            const devices = await LedgerTransport.default.list();
            if (!devices.length) {
                throw new Error("No Ledger device found!");
            }

            const transport = await LedgerTransport.default.create();
            this.app = new appMapping[network.protocol](transport);
        }

        return this.app;
    }

    async signEthereum(
        app: EthereumLedgerApp.default,
        rawTx: RawTransaction<Ethereum>,
        path?: string,
    ): Promise<SignedTransaction<Ethereum>> {
        const serializedTx = rawTx.unsignedSerialized.slice(2);
        const resolution = await ethereumLegerService.resolveTransaction(serializedTx, {}, {});
        const { v, r, s } = await app.signTransaction(
            path || pathMapping[PROTOCOL.ETHEREUM],
            serializedTx,
            resolution,
        );

        const signedTx = Transaction.from({
            ...rawTx.toJSON(),
            signature: {
                v: "0x" + v,
                r: "0x" + r,
                s: "0x" + s,
            },
        }) as SignedTransaction<Ethereum>;

        return signedTx;
    }

    async signNearProtocol(
        app: NearLedgerApp.default,
        rawTx: RawTransaction<NearProtocol>,
        path?: string,
    ): Promise<SignedTransaction<NearProtocol>> {
        const signature = await app.signTransaction(rawTx.encode(), path || pathMapping[PROTOCOL.NEAR_PROTOCOL]);
        const signedTx = new nearApi.transactions.SignedTransaction({
            transaction: rawTx,
            signature: new nearApi.transactions.Signature({
                keyType: rawTx.publicKey.keyType,
                data: signature,
            }),
        });

        return signedTx;
    }

    async getPublicKey<P extends Protocol>(network: NetworkConfig<P>, selector?: string): Promise<string> {
        const app = await this.getApp(network);
        const result = await app.getAddress(selector || pathMapping[network.protocol]);

        if (!result.publicKey) {
            throw new Error("No public key returned!");
        }

        return result.publicKey;
    }

    async getAddress<P extends Protocol>(network: NetworkConfig<P>, selector?: string): Promise<string> {
        const app = await this.getApp(network);
        const result = await app.getAddress(selector || pathMapping[network.protocol]);

        if (!result.address) {
            throw new Error("No address returned!");
        }

        return result.address;
    }

    async sign<P extends Protocol>(rawTx: RawTransaction<P>, network: NetworkConfig<P>, selector?: string): Promise<SignedTransaction<P>> {
        let signedTx: SignedTransaction<P>;
        const app = await this.getApp(network);

        switch (network.protocol) {
        case PROTOCOL.ETHEREUM:
            signedTx = await this.signEthereum(app as EthereumLedgerApp.default, rawTx as RawTransaction<Ethereum>, selector);
            break;
        case PROTOCOL.NEAR_PROTOCOL:
            signedTx = await this.signNearProtocol(app as NearLedgerApp.default, rawTx as RawTransaction<NearProtocol>, selector);
            break;
        default:
            throw new Error(`Ledger signing not supported for ${network.protocol}`);
        }

        return signedTx;
    }

}
