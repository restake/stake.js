import { AvalancheProtocol } from "./src/protocols/avalanche-sdk";
import { FileSystemWallet } from "./src/wallets/filesystem-wallet";

const wallet = new FileSystemWallet("testnet", "/Users/mark/staking-keys/avalanche.json");
const sdk = new AvalancheProtocol(wallet);

let validator: string = "NodeID-3VWnZNViBP2b56QBY7pNJSLzN2rkTyqnK";
let amount: string = "1000000000";

(async () => {
    console.log("creating tx");
    const rawTx = await sdk.buildStakeTransaction(validator, amount, "testing");
    console.log("signing tx");
    const signedTx = await sdk.signTransaction(rawTx);
    console.log("sending tx");
    const sendTx = await sdk.broadcastTransaction(signedTx);
    
    console.log("tx send result:", sendTx);
})().catch((err: Error) => {
    console.error("error:", err);    
    process.exit(1);
})
