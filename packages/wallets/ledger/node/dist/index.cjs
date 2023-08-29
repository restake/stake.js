"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  LedgerNodeWallet: () => LedgerNodeWallet
});
module.exports = __toCommonJS(src_exports);
var import_hw_transport_node_hid = __toESM(require("@ledgerhq/hw-transport-node-hid"), 1);
var import_hw_app_eth = __toESM(require("@ledgerhq/hw-app-eth"), 1);
var import_stakejs_core = require("@restake/stakejs-core");
var appMapping = /* @__PURE__ */ new Map([
  [import_stakejs_core.PROTOCOL.ETHEREUM, import_hw_app_eth.default.default]
]);
var pathMapping = /* @__PURE__ */ new Map([
  [import_stakejs_core.PROTOCOL.ETHEREUM, "44'/60'/0'/0/0"]
]);
var LedgerNodeWallet = class {
  app;
  async getApp(network) {
    if (!this.app) {
      const devices = await import_hw_transport_node_hid.default.default.list();
      if (!devices.length) {
        throw new Error("No Ledger device found!");
      }
      const appBuilder = appMapping.get(network.protocol);
      if (!appBuilder) {
        throw new Error(`No app found for protocol ${network.protocol}`);
      }
      const transport = await import_hw_transport_node_hid.default.default.create();
      this.app = new appBuilder(transport);
    }
    return this.app;
  }
  async sign(rawTx, network, selector) {
    switch (network.protocol) {
      case import_stakejs_core.PROTOCOL.ETHEREUM: {
        const app = await this.getApp(network);
        const signature = {};
        const serializedTx = rawTx.serialize().slice(2);
        const resolution = await import_hw_app_eth.ledgerService.resolveTransaction(serializedTx, {}, {});
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LedgerNodeWallet
});
//# sourceMappingURL=index.cjs.map