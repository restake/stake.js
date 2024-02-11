import LedgerTransport from "@ledgerhq/hw-transport-node-hid";
import EthereumLedgerApp, { ledgerService as ethereumLegerService } from "@ledgerhq/hw-app-eth";
import {
    SignerWallet,
    NetworkConfig,
    Protocol,
    RawTransaction,
    PROTOCOL,
    Signature,
} from "@restake/stakejs-core";

type LedgerApp = typeof EthereumLedgerApp.default;

const appMapping = new Map<Protocol, LedgerApp>([
    [PROTOCOL.ETHEREUM, EthereumLedgerApp.default],
]);

const pathMapping = new Map<Protocol, string>([
    [PROTOCOL.ETHEREUM, "44'/60'/0'/0/0"],
]);


export class LedgerNodeWallet implements SignerWallet {

    app?: LedgerApp[keyof LedgerApp];

    private async getApp(network: NetworkConfig<Protocol>): Promise<LedgerApp[keyof LedgerApp]> {
        if (!this.app) {
            const devices = await LedgerTransport.default.list();
            if (!devices.length) {
                throw new Error("No Ledger device found!");
            }
            const appBuilder = appMapping.get(network.protocol);
            if (!appBuilder) {
                throw new Error(`No app found for protocol ${network.protocol}`);
            }
            const transport = await LedgerTransport.default.create();
            this.app = new appBuilder(transport);
        }

        return this.app;
    }

    async sign<P extends Protocol>(
        rawTx: RawTransaction<P>,
        network: NetworkConfig<P>,
        selector?: string,
    ): Promise<Signature> {
        switch(network.protocol) {
        case PROTOCOL.ETHEREUM: {
            const app = await this.getApp(network);
            const signature: Signature = {};

            const serializedTx = rawTx.serialize().slice(2);
            const resolution = await ethereumLegerService.resolveTransaction(serializedTx, {}, {});
            const { r, s, v: vString } = await app.signTransaction(
                selector || pathMapping.get(network.protocol) || "",
                serializedTx,
                resolution,
            );
            const v = Number(vString);
            signature.r = r;
            signature.s = s;
            signature.v = v;

            return signature;
        }
        default:
            throw new Error(`Wallet does not support protocol ${network.protocol}`);
        }
    }

    async getPublicKey<P extends Protocol>(network: NetworkConfig<P>, selector?: string): Promise<string> {
        const app = await this.getApp(network);
        const result = await app.getAddress(selector || pathMapping.get(network.protocol) || "");

        if (!result.publicKey) {
            throw new Error("No public key returned!");
        }

        return result.publicKey;
    }

    async getAddress<P extends Protocol>(network: NetworkConfig<P>, selector?: string): Promise<string> {
        const app = await this.getApp(network);
        const result = await app.getAddress(selector || pathMapping.get(network.protocol) || "");

        if (!result.address) {
            throw new Error("No address returned!");
        }

        return result.address;
    }

}
