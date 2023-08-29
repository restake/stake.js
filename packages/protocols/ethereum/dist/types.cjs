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

// src/types.ts
var types_exports = {};
__export(types_exports, {
  EthereumDepositData: () => EthereumDepositData,
  EthereumRawTransaction: () => EthereumRawTransaction,
  EthereumSignedTransaction: () => EthereumSignedTransaction
});
module.exports = __toCommonJS(types_exports);
var import_zod = require("zod");
var import_ethers = require("ethers");
var import_stakejs_core = require("@restake/stakejs-core");
var EthereumDepositData = import_zod.z.object({
  pubkey: import_zod.z.coerce.string(),
  withdrawal_credentials: import_zod.z.coerce.string(),
  amount: import_zod.z.coerce.bigint(),
  signature: import_zod.z.coerce.string(),
  deposit_message_root: import_zod.z.coerce.string(),
  deposit_data_root: import_zod.z.coerce.string(),
  fork_version: import_zod.z.coerce.string(),
  network_name: import_zod.z.coerce.string()
});
var EthereumRawTransaction = class {
  protocol = import_stakejs_core.PROTOCOL.ETHEREUM;
  transaction;
  constructor(tx) {
    this.transaction = import_ethers.Transaction.from(tx);
  }
  serialize() {
    return this.transaction.unsignedSerialized;
  }
  getBytes() {
    return (0, import_ethers.getBytes)(this.transaction.unsignedSerialized);
  }
  getHash() {
    return this.transaction.unsignedHash;
  }
  getHashBytes() {
    return (0, import_ethers.getBytes)(this.transaction.unsignedHash);
  }
};
var EthereumSignedTransaction = class {
  protocol = import_stakejs_core.PROTOCOL.ETHEREUM;
  transaction;
  constructor(tx, signature) {
    this.transaction = import_ethers.Transaction.from({
      ...tx.toJSON(),
      signature: {
        v: signature.v,
        r: "0x" + signature.r,
        s: "0x" + signature.s
      }
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EthereumDepositData,
  EthereumRawTransaction,
  EthereumSignedTransaction
});
//# sourceMappingURL=types.cjs.map