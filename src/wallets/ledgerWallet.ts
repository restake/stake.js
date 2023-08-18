import { SignerWallet } from "../wallets";
import { Protocol, RawTransaction, SignedTransaction, NetworkConfig, Ethereum } from "../protocols";
import LedgerTransport from "@ledgerhq/hw-transport-node-hid";
import EthereumLedgerApp, { ledgerService as ethereumLegerService } from "@ledgerhq/hw-app-eth";
import NearLedgerApp from "@ledgerhq/hw-app-near";
import { PROTOCOL } from "../protocols/constants";
import { Transaction } from "ethers";

type LedgerApp = EthereumLedgerApp | NearLedgerApp;

const AppMapping = {
    [PROTOCOL.ETHEREUM]: EthereumLedgerApp,
    [PROTOCOL.NEAR_PROTOCOL]: NearLedgerApp,
};

export class LedgerWallet implements SignerWallet {

    private async getApp(network: NetworkConfig<Protocol>): Promise<LedgerApp> {
        const devices = await LedgerTransport.list();
        if (!devices.length) {
            throw new Error("No Ledger device found!");
        }

        const transport = await LedgerTransport.create();
        const app = new AppMapping[network.protocol](transport);

        return app;
    }

    async signEthereum(app: EthereumLedgerApp, rawTx: RawTransaction<Ethereum>, path?: string): Promise<SignedTransaction<Ethereum>> {
        const serializedTx = rawTx.unsignedSerialized;
        const resolution = await ethereumLegerService.resolveTransaction(serializedTx, {}, {});
        const { v, r, s } = await app.signTransaction(
            path || "44'/60'/0'/0/0",
            serializedTx,
            resolution,
        );

        const signedTx = Transaction.from({
            ...rawTx,
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
            signedTx = await this.signEthereum(app as EthereumLedgerApp, rawTx as RawTransaction<Ethereum>, accountId);
        } else {
            throw new Error(`Ledger signing not supported for ${network.protocol}`);
        }

        return signedTx;
    }

}
