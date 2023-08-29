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

// src/types.ts
var types_exports = {};
__export(types_exports, {
  NearProtocolRawTransaction: () => NearProtocolRawTransaction,
  NearProtocolSignedTransaction: () => NearProtocolSignedTransaction
});
module.exports = __toCommonJS(types_exports);
var import_stakejs_core = require("@restake/stakejs-core");
var nearApi = __toESM(require("near-api-js"), 1);
var import_js_sha256 = require("js-sha256");
var NearProtocolRawTransaction = class {
  protocol = import_stakejs_core.PROTOCOL.NEAR_PROTOCOL;
  transaction;
  constructor(tx) {
    this.transaction = tx;
  }
  serialize() {
    return Buffer.from(this.transaction.encode()).toString("hex");
  }
  getBytes() {
    return this.transaction.encode();
  }
  getHash() {
    return (0, import_js_sha256.sha256)(this.transaction.encode());
  }
  getHashBytes() {
    return new Uint8Array(import_js_sha256.sha256.array(this.transaction.encode()));
  }
};
var NearProtocolSignedTransaction = class {
  protocol = import_stakejs_core.PROTOCOL.NEAR_PROTOCOL;
  transaction;
  constructor(rawTx, signature) {
    const nearApiSignature = new nearApi.transactions.Signature({
      keyType: rawTx.publicKey.keyType,
      data: signature.data
    });
    const nearApiSignedTx = new nearApi.transactions.SignedTransaction({
      transaction: rawTx,
      signature: nearApiSignature
    });
    this.transaction = nearApiSignedTx;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NearProtocolRawTransaction,
  NearProtocolSignedTransaction
});
//# sourceMappingURL=types.cjs.map