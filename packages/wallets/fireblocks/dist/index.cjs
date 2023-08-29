"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  FireblocksWallet: () => FireblocksWallet
});
module.exports = __toCommonJS(src_exports);
var import_stakejs_core = require("@restake/stakejs-core");
var import_fireblocks_sdk = require("fireblocks-sdk");
function createMapEntry(config, value) {
  const key = `${config.protocol}-${config.network.name}`;
  return [key, value];
}
var fbProtocolMapping = new Map([
  createMapEntry({ protocol: import_stakejs_core.PROTOCOL.ETHEREUM, network: { name: "mainnet" } }, "ETH"),
  createMapEntry({ protocol: import_stakejs_core.PROTOCOL.ETHEREUM, network: { name: "goerli" } }, "ETH_TEST3"),
  createMapEntry({ protocol: import_stakejs_core.PROTOCOL.NEAR_PROTOCOL, network: { name: "mainnet" } }, "NEAR"),
  createMapEntry({ protocol: import_stakejs_core.PROTOCOL.NEAR_PROTOCOL, network: { name: "testnet" } }, "NEAR_TEST")
]);
var FireblocksWallet = class {
  fb;
  vaultId;
  constructor(apiKey, apiSecret, vaultId) {
    this.fb = new import_fireblocks_sdk.FireblocksSDK(apiSecret, apiKey);
    this.vaultId = vaultId;
  }
  getFbNetworkId(networkConfig) {
    const key = `${networkConfig.protocol}-${networkConfig.network.name}`;
    const fbNetworkId = fbProtocolMapping.get(key);
    if (!fbNetworkId) {
      throw new Error(`Fireblocks network id not found for ${networkConfig.protocol} ${networkConfig.network.name}`);
    }
    return fbNetworkId;
  }
  async getAddress(networkConfig, selector) {
    try {
      const index = parseInt(selector || "0");
      const args = {
        assetId: this.getFbNetworkId(networkConfig),
        vaultAccountId: parseInt(this.vaultId),
        change: 0,
        addressIndex: index,
        compressed: false
      };
      const pubKey = await this.fb.getPublicKeyInfoForVaultAccount(args);
      return pubKey.publicKey;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  async getPublicKey(_networkConfig, _selector) {
    throw new Error("Cannot get public key from Fireblocks.");
  }
  async sign(rawTx, networkConfig, selector) {
    const txHash = rawTx.getHashBytes();
    const payload = {
      rawMessageData: {
        messages: [{
          content: Buffer.from(txHash).toString("hex")
        }]
      }
    };
    console.log(payload);
    const fireblocksTx = await this.fb.createTransaction({
      assetId: this.getFbNetworkId(networkConfig),
      operation: import_fireblocks_sdk.TransactionOperation.RAW,
      source: {
        type: import_fireblocks_sdk.PeerType.VAULT_ACCOUNT,
        id: this.vaultId
      },
      extraParameters: payload
    });
    console.log(fireblocksTx);
    let tx = await this.fb.getTransactionById(fireblocksTx.id);
    while (tx.status != import_fireblocks_sdk.TransactionStatus.COMPLETED) {
      console.log(`Current transaction status: ${tx.status}`);
      if (tx.status == import_fireblocks_sdk.TransactionStatus.BLOCKED || tx.status == import_fireblocks_sdk.TransactionStatus.FAILED || tx.status == import_fireblocks_sdk.TransactionStatus.REJECTED || tx.status == import_fireblocks_sdk.TransactionStatus.CANCELLED) {
        throw Error(`Transaction was not completed | STATUS: ${tx.status}.`);
      }
      tx = await this.fb.getTransactionById(fireblocksTx.id);
      await new Promise((resolve) => setTimeout(resolve, 5e3));
    }
    console.log(`Current transaction status: ${tx.status}`);
    const index = parseInt(selector || "0");
    const sig = tx.signedMessages[index].signature;
    const signature = {
      data: Buffer.from(sig.fullSig, "hex"),
      r: sig.r,
      s: sig.s,
      v: sig.v
    };
    return signature;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FireblocksWallet
});
//# sourceMappingURL=index.cjs.map