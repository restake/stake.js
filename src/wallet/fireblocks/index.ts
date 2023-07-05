import {
    fireblocksAlgorithmToKeyType,
    FireblocksKeyAlgorithm,
    FireblocksSignerProvider,
} from "../../core/signer/provider/FireblocksSignerProvider.ts";
import { Signer } from "../../core/signer/signer.ts";
import { __USING_CORE_SDK, SignerWallet } from "../index.ts";

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

    __provider: FireblocksSignerProvider<never, never>;
    __vaultAccountId: string;

    constructor(
        apiKey: string,
        apiSecret: string,
        vaultAccountId: string,
        apiBaseUrl: string = "https://api.fireblocks.io",
    ) {
        this.__provider = new FireblocksSignerProvider(
            apiKey,
            apiSecret,
            apiBaseUrl,
        );
        this.__vaultAccountId = vaultAccountId;
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

    async keyType(protocol: string): Promise<string> {
        const asset = knownAssets[protocol];
        if (!asset) {
            throw new Error(`Unsupported asset "${asset}"`);
        }

        const { expectedAlgorithm } = asset;

        return fireblocksAlgorithmToKeyType[expectedAlgorithm];
    }

    private async getSigner(protocol: string): Promise<Signer<never>> {
        const asset = knownAssets[protocol];
        if (!asset) {
            throw new Error(`Unsupported asset "${asset}"`);
        }

        const signer = await this.__provider.getSigner(this.__vaultAccountId, {
            assetId: asset.assetId,
            expectedAlgorithm: asset.expectedAlgorithm,
        });

        return signer;
    }
}

export default FireblocksWallet;
