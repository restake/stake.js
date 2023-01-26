import { FireblocksSDK } from "fireblocks-sdk";

export class FireblocksProvider {
    fbEngine: FireblocksSDK;
    vaultId: string;

    constructor(apiKey: string, secretKey: string, vaultId: string) {
        this.fbEngine = new FireblocksSDK(secretKey, apiKey);
        this.vaultId = vaultId;
    }
}
