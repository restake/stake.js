import { FireblocksKeyAlgorithm, FireblocksSignerProvider } from "../../core/signer/provider/FireblocksSignerProvider.js";
import { Signer } from "../../core/signer/signer.js";
import { SignerWallet, __USING_CORE_SDK } from "../index.js";

// Protocol -> Fireblocks asset id
type AssetInfo = {
    assetId: string;
    expectedAlgorithm: FireblocksKeyAlgorithm;
};

const knownAssets: Record<string, AssetInfo> = {
    "avalanche": {
        assetId: "AVAX",
        expectedAlgorithm: "MPC_ECDSA_SECP256K1",
    },
    "ethereum": {
        assetId: "ETH",
        expectedAlgorithm: "MPC_ECDSA_SECP256K1",
    },
    "near": {
        assetId: "NEAR",
        expectedAlgorithm: "MPC_EDDSA_ED25519",
    },
};

export class FireblocksWallet implements SignerWallet {
    [__USING_CORE_SDK] = true;

    #provider: FireblocksSignerProvider<never, never>;
    #vaultAccountId: string;

    constructor(apiKey: string, apiSecret: string, vaultAccountId: string, apiBaseUrl: string = "https://api.fireblocks.io") {
        this.#provider = new FireblocksSignerProvider(
            apiKey,
            apiSecret,
            apiBaseUrl,
        );
        this.#vaultAccountId = vaultAccountId;
    }

    async sign(protocol: string, data: Uint8Array): Promise<Uint8Array> {
        const signer = await this.getSigner(protocol);

        return await signer.sign(data);
    }

    async publicKey(protocol: string): Promise<Uint8Array> {
        const signer = await this.getSigner(protocol);

        return signer.publicKey.bytes;
    }

    async accountId(_protocol: string): Promise<string | null> {
        return null;
    }

    private async getSigner(protocol: string): Promise<Signer<never>> {
        const asset = knownAssets[protocol];
        if (!asset) {
            throw new Error(`Unsupported asset "${asset}"`);
        }

        const signer = await this.#provider.getSigner(this.#vaultAccountId, {
            assetId: asset.assetId,
            expectedAlgorithm: asset.expectedAlgorithm,
        });

        return signer;
    }
}

export default FireblocksWallet;
