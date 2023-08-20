import { SignerWallet } from "../wallets/index.ts";
import { Protocol, RawTransaction, SignedTransaction, NetworkConfig, Ethereum } from "../protocols/index.ts";
import LedgerTransport from "@ledgerhq/hw-transport-node-hid";
import EthereumLedgerApp, { ledgerService as ethereumLegerService } from "@ledgerhq/hw-app-eth";
import NearLedgerApp from "@ledgerhq/hw-app-near";
import { PROTOCOL } from "../protocols/constants.ts";
import { Transaction } from "ethers";

type LedgerApp = EthereumLedgerApp.default | NearLedgerApp.default;

const AppMapping = {
    [PROTOCOL.ETHEREUM]: EthereumLedgerApp.default,
    [PROTOCOL.NEAR_PROTOCOL]: NearLedgerApp.default,
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
            this.app = new AppMapping[network.protocol](transport);
        }

        return this.app;
    }

    async signEthereum(
        app: EthereumLedgerApp.default,
        rawTx: RawTransaction<Ethereum>,
        path?: string
    ): Promise<SignedTransaction<Ethereum>> {
        const serializedTx = rawTx.unsignedSerialized.slice(2);
        const resolution = await ethereumLegerService.resolveTransaction(serializedTx, {}, {});
        const { v, r, s } = await app.signTransaction(
            path || "44'/60'/0'/0/0",
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

    async getAddress<P extends Protocol>(network: NetworkConfig<P>, accountId?: string): Promise<string> {
        const app = await this.getApp(network);
        const address = await app.getAddress(accountId || "44'/60'/0'/0/0");

        return address.address;
    }

    async sign<P extends Protocol>(rawTx: RawTransaction<P>, network: NetworkConfig<P>, accountId?: string): Promise<SignedTransaction<P>> {
        let signedTx: SignedTransaction<P>;
        const app = await this.getApp(network);

        if (network.protocol === PROTOCOL.ETHEREUM) {
            signedTx = await this.signEthereum(app as EthereumLedgerApp.default, rawTx as RawTransaction<Ethereum>, accountId);
        } else {
            throw new Error(`Ledger signing not supported for ${network.protocol}`);
        }

        return signedTx;
    }

}
