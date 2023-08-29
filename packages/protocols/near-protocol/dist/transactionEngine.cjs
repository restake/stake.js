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

// src/transactionEngine.ts
var transactionEngine_exports = {};
__export(transactionEngine_exports, {
  NearProtocolTransactionEngine: () => NearProtocolTransactionEngine
});
module.exports = __toCommonJS(transactionEngine_exports);
var import_bn = __toESM(require("bn.js"), 1);
var nearApi2 = __toESM(require("near-api-js"), 1);
var import_transaction = require("near-api-js/lib/transaction.js");
var import_utils = require("near-api-js/lib/utils/index.js");
var import_near_api_js = require("near-api-js");

// src/types.ts
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

// src/constants.ts
var NEAR_PROTOCOL_NETWORKS = {
  MAINNET: "mainnet",
  TESTNET: "testnet"
};
var NEAR_PROTOCOL_DEFAULT_RPC_URLS = {
  [NEAR_PROTOCOL_NETWORKS.MAINNET]: new URL("https://rpc.ankr.com/near"),
  [NEAR_PROTOCOL_NETWORKS.TESTNET]: new URL("https://rpc.testnet.near.org")
};

// src/transactionEngine.ts
var ZERO_BN = new import_bn.default(0);
var MAX_GAS_BN = new import_bn.default(3e14);
var toYocto = (amount) => {
  const yoctoAmount = nearApi2.utils.format.parseNearAmount(amount.toString());
  if (!yoctoAmount) {
    throw new Error(`Unable to parse NEAR amount ${amount}`);
  }
  return yoctoAmount;
};
var NearProtocolTransactionEngine = class {
  rpcUrl;
  networkConfig;
  near;
  constructor(network = { name: "mainnet" }, rpcUrl) {
    this.networkConfig = { protocol: "near-protocol", network };
    this.rpcUrl = rpcUrl || NEAR_PROTOCOL_DEFAULT_RPC_URLS[network.name];
  }
  async init() {
    this.near = await (0, import_near_api_js.connect)({
      networkId: this.networkConfig.network.name,
      nodeUrl: this.rpcUrl.toString()
    });
  }
  async getNear() {
    if (!this.near) {
      await this.init();
    }
    return this.near;
  }
  buildAction(method, amount) {
    let action;
    switch (method) {
      case "deposit_and_stake" /* stake */:
        if (!amount) {
          throw new Error("You need to specify an amount to stake.");
        } else {
          action = (0, import_transaction.functionCall)(method, {}, MAX_GAS_BN, new import_bn.default(toYocto(amount)));
        }
        break;
      case "unstake" /* unstake */:
      case "withdraw" /* withdraw */:
        if (typeof amount === "undefined") {
          throw new Error(`You need to specify an amount to ${method}.`);
        } else {
          action = (0, import_transaction.functionCall)(
            method,
            { amount: toYocto(amount) },
            MAX_GAS_BN,
            ZERO_BN
          );
        }
        break;
      case "unstake_all" /* unstakeAll */:
      case "withdraw_all" /* withdrawAll */:
        action = (0, import_transaction.functionCall)(method, {}, MAX_GAS_BN, ZERO_BN);
        break;
      default:
        throw new Error(`Unknwon method ${method}.`);
    }
    return action;
  }
  async buildTransaction(wallet, method, validator, amount, accountId, selector) {
    const near = await this.getNear();
    let accessKey;
    const signerId = accountId || await wallet.getAddress(this.networkConfig, selector);
    const account = await near.account(signerId);
    if (accountId) {
      const accountPk = await wallet.getPublicKey(this.networkConfig, selector);
      const accessKeys = await account.getAccessKeys();
      accessKey = accessKeys.find(
        (accessKey2) => accessKey2.public_key === accountPk && accessKey2.access_key.permission === "FullAccess"
      );
      if (!accessKey) {
        throw new Error(`Could not find Full Access Key for account [ ${accountId} ]`);
      }
    } else {
      const accessKeys = await account.getAccessKeys();
      accessKey = accessKeys[0];
    }
    const publicKey = import_utils.PublicKey.fromString(accessKey.public_key);
    const nonce = accessKey?.access_key.nonce.add(new import_bn.default(1));
    const actions = [this.buildAction(method, amount)];
    const queryAccessKey = await near.connection.provider.query(`access_key/${signerId}/${publicKey.toString()}`, "");
    const recentBlockHash = nearApi2.utils.serialize.base_decode(queryAccessKey.block_hash);
    const nearApiRawTx = nearApi2.transactions.createTransaction(
      signerId,
      publicKey,
      validator,
      nonce,
      actions,
      recentBlockHash
    );
    const rawTx = new NearProtocolRawTransaction(nearApiRawTx);
    return rawTx;
  }
  async buildStakeTx(wallet, validator, amount, accountId, selector) {
    return await this.buildTransaction(wallet, "deposit_and_stake" /* stake */, validator, amount, accountId, selector);
  }
  async buildUnstakeTx(wallet, validator, amount, accountId, selector) {
    const method = amount === "all" ? "unstake_all" /* unstakeAll */ : "unstake" /* unstake */;
    return await this.buildTransaction(wallet, method, validator, amount === "all" ? void 0 : amount, accountId, selector);
  }
  async buildWithdrawTx(wallet, validator, amount, accountId, selector) {
    const method = amount === "all" ? "withdraw_all" /* withdrawAll */ : "withdraw" /* withdraw */;
    return await this.buildTransaction(wallet, method, validator, amount === "all" ? void 0 : amount, accountId, selector);
  }
  async sign(wallet, rawTx, selector) {
    const signature = await wallet.sign(rawTx, this.networkConfig, selector);
    const signedTx = new NearProtocolSignedTransaction(rawTx.transaction, signature);
    return signedTx;
  }
  async broadcast(signedTx) {
    try {
      const near = await this.getNear();
      const result = await near.connection.provider.sendTransaction(signedTx.transaction);
      return result.transaction.hash;
    } catch (error) {
      console.log("An error occurred while trying to broadcast the transaction.");
      throw error;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NearProtocolTransactionEngine
});
//# sourceMappingURL=transactionEngine.cjs.map