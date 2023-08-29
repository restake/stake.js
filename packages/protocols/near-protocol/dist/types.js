// src/types.ts
import { PROTOCOL } from "@restake/stakejs-core";
import * as nearApi from "near-api-js";
import { sha256 } from "js-sha256";
var NearProtocolRawTransaction = class {
  protocol = PROTOCOL.NEAR_PROTOCOL;
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
    return sha256(this.transaction.encode());
  }
  getHashBytes() {
    return new Uint8Array(sha256.array(this.transaction.encode()));
  }
};
var NearProtocolSignedTransaction = class {
  protocol = PROTOCOL.NEAR_PROTOCOL;
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
export {
  NearProtocolRawTransaction,
  NearProtocolSignedTransaction
};
//# sourceMappingURL=types.js.map