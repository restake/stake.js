// src/index.ts
import { PROTOCOL } from "@restake/stakejs-core";
import { FireblocksSDK, PeerType, TransactionOperation, TransactionStatus } from "fireblocks-sdk";
function createMapEntry(config, value) {
  const key = `${config.protocol}-${config.network.name}`;
  return [key, value];
}
var fbProtocolMapping = new Map([
  createMapEntry({ protocol: PROTOCOL.ETHEREUM, network: { name: "mainnet" } }, "ETH"),
  createMapEntry({ protocol: PROTOCOL.ETHEREUM, network: { name: "goerli" } }, "ETH_TEST3"),
  createMapEntry({ protocol: PROTOCOL.NEAR_PROTOCOL, network: { name: "mainnet" } }, "NEAR"),
  createMapEntry({ protocol: PROTOCOL.NEAR_PROTOCOL, network: { name: "testnet" } }, "NEAR_TEST")
]);
var FireblocksWallet = class {
  fb;
  vaultId;
  constructor(apiKey, apiSecret, vaultId) {
    this.fb = new FireblocksSDK(apiSecret, apiKey);
    this.vaultId = vaultId;
  }
  getFbNetworkId(networkConfig) {
    const key = `${networkConfig.protocol}-${networkConfig.network.name}`;
    const fbNetworkId = fbProtocolMapping.get(key);
    if (!fbNetworkId) {
      throw new Error(`Fireblocks network id not found for ${networkConfig.protocol} ${networkConfig.network.name}`);
    }
    return fbNetworkId;
  }
  async getAddress(networkConfig, selector) {
    try {
      const index = parseInt(selector || "0");
      const args = {
        assetId: this.getFbNetworkId(networkConfig),
        vaultAccountId: parseInt(this.vaultId),
        change: 0,
        addressIndex: index,
        compressed: false
      };
      const pubKey = await this.fb.getPublicKeyInfoForVaultAccount(args);
      return pubKey.publicKey;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  async getPublicKey(_networkConfig, _selector) {
    throw new Error("Cannot get public key from Fireblocks.");
  }
  async sign(rawTx, networkConfig, selector) {
    const txHash = rawTx.getHashBytes();
    const payload = {
      rawMessageData: {
        messages: [{
          content: Buffer.from(txHash).toString("hex")
        }]
      }
    };
    console.log(payload);
    const fireblocksTx = await this.fb.createTransaction({
      assetId: this.getFbNetworkId(networkConfig),
      operation: TransactionOperation.RAW,
      source: {
        type: PeerType.VAULT_ACCOUNT,
        id: this.vaultId
      },
      extraParameters: payload
    });
    console.log(fireblocksTx);
    let tx = await this.fb.getTransactionById(fireblocksTx.id);
    while (tx.status != TransactionStatus.COMPLETED) {
      console.log(`Current transaction status: ${tx.status}`);
      if (tx.status == TransactionStatus.BLOCKED || tx.status == TransactionStatus.FAILED || tx.status == TransactionStatus.REJECTED || tx.status == TransactionStatus.CANCELLED) {
        throw Error(`Transaction was not completed | STATUS: ${tx.status}.`);
      }
      tx = await this.fb.getTransactionById(fireblocksTx.id);
      await new Promise((resolve) => setTimeout(resolve, 5e3));
    }
    console.log(`Current transaction status: ${tx.status}`);
    const index = parseInt(selector || "0");
    const sig = tx.signedMessages[index].signature;
    const signature = {
      data: Buffer.from(sig.fullSig, "hex"),
      r: sig.r,
      s: sig.s,
      v: sig.v
    };
    return signature;
  }
};
export {
  FireblocksWallet
};
//# sourceMappingURL=index.js.map