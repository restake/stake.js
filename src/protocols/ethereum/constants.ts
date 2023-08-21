export const ETHEREUM_NETWORKS = {
    MAINNET: "mainnet",
    GOERLI: "goerli",
} as const;

export const ETHEREUM_NETWORK_CHAIN_IDS = {
    [ETHEREUM_NETWORKS.MAINNET]: 1,
    [ETHEREUM_NETWORKS.GOERLI]: 5,
} as const;

export const DEFAULT_RPC_URLS = {
    [ETHEREUM_NETWORKS.MAINNET]: new URL("https://rpc.ankr.com/eth"),
    [ETHEREUM_NETWORKS.GOERLI]: new URL("https://rpc.ankr.com/eth_goerli"),
} as const;

export const DEPOSIT_CONTRACT_ADDRESS = {
    [ETHEREUM_NETWORKS.MAINNET]: "0x00000000219ab540356cBB839Cbe05303d7705Fa",
    [ETHEREUM_NETWORKS.GOERLI]: "0x00000000219ab540356cBB839Cbe05303d7705Fa",
} as const;

export const DEPOSIT_CONTRACT_ABI = `
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
