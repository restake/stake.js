// src/service.ts
import { ProtocolService } from "@restake/stakejs-core";

// src/transactionEngine.ts
import BN from "bn.js";
import * as nearApi2 from "near-api-js";
import { functionCall } from "near-api-js/lib/transaction.js";
import { PublicKey } from "near-api-js/lib/utils/index.js";
import { connect } from "near-api-js";

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
var ZERO_BN = new BN(0);
var MAX_GAS_BN = new BN(3e14);
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
    this.near = await connect({
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
          action = functionCall(method, {}, MAX_GAS_BN, new BN(toYocto(amount)));
        }
        break;
      case "unstake" /* unstake */:
      case "withdraw" /* withdraw */:
        if (typeof amount === "undefined") {
          throw new Error(`You need to specify an amount to ${method}.`);
        } else {
          action = functionCall(
            method,
            { amount: toYocto(amount) },
            MAX_GAS_BN,
            ZERO_BN
          );
        }
        break;
      case "unstake_all" /* unstakeAll */:
      case "withdraw_all" /* withdrawAll */:
        action = functionCall(method, {}, MAX_GAS_BN, ZERO_BN);
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
    const publicKey = PublicKey.fromString(accessKey.public_key);
    const nonce = accessKey?.access_key.nonce.add(new BN(1));
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

// src/service.ts
var NearProtocolService = class extends ProtocolService {
  tx;
  constructor(network = { name: "mainnet" }, rpcUrl) {
    super();
    this.tx = new NearProtocolTransactionEngine(network, rpcUrl);
  }
  async stake(wallet, validator, amount, accountId, selector) {
    const rawTx = await this.tx.buildStakeTx(wallet, validator, amount, accountId, selector);
    const signedTx = await this.tx.sign(wallet, rawTx);
    const txId = await this.tx.broadcast(signedTx);
    return txId;
  }
  async withdraw(wallet, validator, amount, accountId, selector) {
    const rawTx = await this.tx.buildWithdrawTx(wallet, validator, amount, accountId, selector);
    const signedTx = await this.tx.sign(wallet, rawTx);
    const txId = await this.tx.broadcast(signedTx);
    return txId;
  }
  async unstake(wallet, validator, amount, accountId, selector) {
    const rawTx = await this.tx.buildUnstakeTx(wallet, validator, amount, accountId, selector);
    const signedTx = await this.tx.sign(wallet, rawTx);
    const txId = await this.tx.broadcast(signedTx);
    return txId;
  }
};
export {
  NearProtocolService
};
//# sourceMappingURL=service.js.map