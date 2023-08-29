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

// src/transactionEngine.ts
var transactionEngine_exports = {};
__export(transactionEngine_exports, {
  EthereumTransactionEngine: () => EthereumTransactionEngine
});
module.exports = __toCommonJS(transactionEngine_exports);
var import_ethers2 = require("ethers");
var import_stakejs_core2 = require("@restake/stakejs-core");

// src/constants.ts
var ETHEREUM_NETWORKS = {
  MAINNET: "mainnet",
  GOERLI: "goerli"
};
var ETHEREUM_NETWORK_CHAIN_IDS = {
  [ETHEREUM_NETWORKS.MAINNET]: 1,
  [ETHEREUM_NETWORKS.GOERLI]: 5
};
var ETHEREUM_DEFAULT_RPC_URLS = {
  [ETHEREUM_NETWORKS.MAINNET]: new URL("https://rpc.ankr.com/eth"),
  [ETHEREUM_NETWORKS.GOERLI]: new URL("https://rpc.ankr.com/eth_goerli")
};
var ETHEREUM_DEPOSIT_CONTRACT_ADDRESS = {
  [ETHEREUM_NETWORKS.MAINNET]: "0x00000000219ab540356cBB839Cbe05303d7705Fa",
  [ETHEREUM_NETWORKS.GOERLI]: "0x00000000219ab540356cBB839Cbe05303d7705Fa"
};
var ETHEREUM_DEPOSIT_CONTRACT_ABI = `
[
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "bytes", "name": "pubkey", "type": "bytes" },
      { "indexed": false, "internalType": "bytes", "name": "withdrawal_credentials", "type": "bytes" },
      { "indexed": false, "internalType": "bytes", "name": "amount", "type": "bytes" },
      { "indexed": false, "internalType": "bytes", "name": "signature", "type": "bytes" },
      { "indexed": false, "internalType": "bytes", "name": "index", "type": "bytes" }
    ],
    "name": "DepositEvent",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes", "name": "pubkey", "type": "bytes" },
      { "internalType": "bytes", "name": "withdrawal_credentials", "type": "bytes" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" },
      { "internalType": "bytes32", "name": "deposit_data_root", "type": "bytes32" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "get_deposit_count",
    "outputs": [ { "internalType": "bytes", "name": "", "type": "bytes" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "get_deposit_root",
    "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" } ],
    "name": "supportsInterface",
    "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ],
    "stateMutability": "pure",
    "type": "function"
  }
]
`.trim();

// src/types.ts
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

// src/transactionEngine.ts
var EthereumTransactionEngine = class {
  rpcUrl;
  networkConfig;
  constructor(network = { name: "mainnet" }, rpcUrl) {
    this.networkConfig = { protocol: import_stakejs_core2.PROTOCOL.ETHEREUM, network };
    this.rpcUrl = rpcUrl || ETHEREUM_DEFAULT_RPC_URLS[network.name];
  }
  async fetchGasLimitEstimate(to, data) {
    const response = await fetch(this.rpcUrl.toString(), {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_estimateGas",
        params: [{ to, data }]
      })
    });
    const jsonResponse = await response.json();
    return BigInt(jsonResponse.result);
  }
  encodeDepositData(depositData) {
    const iface = new import_ethers2.Interface(ETHEREUM_DEPOSIT_CONTRACT_ABI);
    const encodedData = iface.encodeFunctionData("deposit", [
      "0x" + depositData.pubkey,
      "0x" + depositData.withdrawal_credentials,
      "0x" + depositData.signature,
      "0x" + depositData.deposit_data_root
    ]);
    return encodedData;
  }
  async buildStakeTx(wallet, depositData, selector) {
    const jsonRpcProvider = new import_ethers2.JsonRpcProvider(this.rpcUrl.toString());
    const nonce = await jsonRpcProvider.getTransactionCount(wallet.getAddress(this.networkConfig), selector);
    const feeData = await jsonRpcProvider.getFeeData();
    const to = ETHEREUM_DEPOSIT_CONTRACT_ADDRESS[this.networkConfig.network.name];
    const data = this.encodeDepositData(depositData);
    const value = depositData.amount * 10n ** 9n;
    const gasLimitEstimate = await this.fetchGasLimitEstimate(to, data);
    const maxPriorityFeePerGas = feeData["maxPriorityFeePerGas"];
    const maxFeePerGas = feeData["maxFeePerGas"];
    const rawTx = new EthereumRawTransaction({
      type: 2,
      nonce,
      to,
      data,
      value,
      gasLimit: gasLimitEstimate,
      maxPriorityFeePerGas,
      maxFeePerGas,
      chainId: ETHEREUM_NETWORK_CHAIN_IDS[this.networkConfig.network.name]
    });
    return rawTx;
  }
  async sign(wallet, rawTx, selector) {
    const signature = await wallet.sign(rawTx, this.networkConfig, selector);
    const signedTx = new EthereumSignedTransaction(rawTx.transaction, signature);
    return signedTx;
  }
  async broadcast(signedTx) {
    const jsonRpcProvider = new import_ethers2.JsonRpcProvider(this.rpcUrl.toString());
    const response = await jsonRpcProvider.broadcastTransaction(signedTx.transaction.serialized);
    return response.hash;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EthereumTransactionEngine
});
//# sourceMappingURL=transactionEngine.cjs.map