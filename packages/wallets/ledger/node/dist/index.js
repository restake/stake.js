// src/index.ts
import LedgerTransport from "@ledgerhq/hw-transport-node-hid";
import EthereumLedgerApp, { ledgerService as ethereumLegerService } from "@ledgerhq/hw-app-eth";
import {
  PROTOCOL
} from "@restake/stakejs-core";
var appMapping = /* @__PURE__ */ new Map([
  [PROTOCOL.ETHEREUM, EthereumLedgerApp.default]
]);
var pathMapping = /* @__PURE__ */ new Map([
  [PROTOCOL.ETHEREUM, "44'/60'/0'/0/0"]
]);
var LedgerNodeWallet = class {
  app;
  async getApp(network) {
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
  async sign(rawTx, network, selector) {
    switch (network.protocol) {
      case PROTOCOL.ETHEREUM: {
        const app = await this.getApp(network);
        const signature = {};
        const serializedTx = rawTx.serialize().slice(2);
        const resolution = await ethereumLegerService.resolveTransaction(serializedTx, {}, {});
        const { r, s, v: vString } = await app.signTransaction(
          selector || pathMapping.get(network.protocol) || "",
          serializedTx,
          resolution
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
  async getPublicKey(network, selector) {
    const app = await this.getApp(network);
    const result = await app.getAddress(selector || pathMapping.get(network.protocol) || "");
    if (!result.publicKey) {
      throw new Error("No public key returned!");
    }
    return result.publicKey;
  }
  async getAddress(network, selector) {
    const app = await this.getApp(network);
    const result = await app.getAddress(selector || pathMapping.get(network.protocol) || "");
    if (!result.address) {
      throw new Error("No address returned!");
    }
    return result.address;
  }
};
export {
  LedgerNodeWallet
};
//# sourceMappingURL=index.js.map