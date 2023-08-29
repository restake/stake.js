// src/constants.ts
var NEAR_PROTOCOL_NETWORKS = {
  MAINNET: "mainnet",
  TESTNET: "testnet"
};
var NEAR_PROTOCOL_DEFAULT_RPC_URLS = {
  [NEAR_PROTOCOL_NETWORKS.MAINNET]: new URL("https://rpc.ankr.com/near"),
  [NEAR_PROTOCOL_NETWORKS.TESTNET]: new URL("https://rpc.testnet.near.org")
};
export {
  NEAR_PROTOCOL_DEFAULT_RPC_URLS,
  NEAR_PROTOCOL_NETWORKS
};
//# sourceMappingURL=constants.js.map