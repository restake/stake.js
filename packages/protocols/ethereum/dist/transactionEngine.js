// src/transactionEngine.ts
import { Interface, JsonRpcProvider } from "ethers";
import { PROTOCOL as PROTOCOL2 } from "@restake/stakejs-core";

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
import { z } from "zod";
import { Transaction, getBytes } from "ethers";
import { PROTOCOL } from "@restake/stakejs-core";
var EthereumDepositData = z.object({
  pubkey: z.coerce.string(),
  withdrawal_credentials: z.coerce.string(),
  amount: z.coerce.bigint(),
  signature: z.coerce.string(),
  deposit_message_root: z.coerce.string(),
  deposit_data_root: z.coerce.string(),
  fork_version: z.coerce.string(),
  network_name: z.coerce.string()
});
var EthereumRawTransaction = class {
  protocol = PROTOCOL.ETHEREUM;
  transaction;
  constructor(tx) {
    this.transaction = Transaction.from(tx);
  }
  serialize() {
    return this.transaction.unsignedSerialized;
  }
  getBytes() {
    return getBytes(this.transaction.unsignedSerialized);
  }
  getHash() {
    return this.transaction.unsignedHash;
  }
  getHashBytes() {
    return getBytes(this.transaction.unsignedHash);
  }
};
var EthereumSignedTransaction = class {
  protocol = PROTOCOL.ETHEREUM;
  transaction;
  constructor(tx, signature) {
    this.transaction = Transaction.from({
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
    this.networkConfig = { protocol: PROTOCOL2.ETHEREUM, network };
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
    const iface = new Interface(ETHEREUM_DEPOSIT_CONTRACT_ABI);
    const encodedData = iface.encodeFunctionData("deposit", [
      "0x" + depositData.pubkey,
      "0x" + depositData.withdrawal_credentials,
      "0x" + depositData.signature,
      "0x" + depositData.deposit_data_root
    ]);
    return encodedData;
  }
  async buildStakeTx(wallet, depositData, selector) {
    const jsonRpcProvider = new JsonRpcProvider(this.rpcUrl.toString());
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
    const jsonRpcProvider = new JsonRpcProvider(this.rpcUrl.toString());
    const response = await jsonRpcProvider.broadcastTransaction(signedTx.transaction.serialized);
    return response.hash;
  }
};
export {
  EthereumTransactionEngine
};
//# sourceMappingURL=transactionEngine.js.map