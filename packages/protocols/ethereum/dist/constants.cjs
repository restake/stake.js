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

// src/constants.ts
var constants_exports = {};
__export(constants_exports, {
  ETHEREUM_DEFAULT_RPC_URLS: () => ETHEREUM_DEFAULT_RPC_URLS,
  ETHEREUM_DEPOSIT_CONTRACT_ABI: () => ETHEREUM_DEPOSIT_CONTRACT_ABI,
  ETHEREUM_DEPOSIT_CONTRACT_ADDRESS: () => ETHEREUM_DEPOSIT_CONTRACT_ADDRESS,
  ETHEREUM_NETWORKS: () => ETHEREUM_NETWORKS,
  ETHEREUM_NETWORK_CHAIN_IDS: () => ETHEREUM_NETWORK_CHAIN_IDS
});
module.exports = __toCommonJS(constants_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ETHEREUM_DEFAULT_RPC_URLS,
  ETHEREUM_DEPOSIT_CONTRACT_ABI,
  ETHEREUM_DEPOSIT_CONTRACT_ADDRESS,
  ETHEREUM_NETWORKS,
  ETHEREUM_NETWORK_CHAIN_IDS
});
//# sourceMappingURL=constants.cjs.map