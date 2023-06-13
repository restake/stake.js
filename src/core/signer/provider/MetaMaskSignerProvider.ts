import { SignOpts } from "@noble/curves/abstract/weierstrass";
import { ECDSASignature, secp256k1PublicKey, secp256k1Signer } from "../index.js";
import { SignerProvider } from "./provider.js";
import { bytesToHex } from "@noble/hashes/utils";
import { toChecksumAddress } from "../../protocol/ethereum/EthereumSigner.js";

export class MetaMaskSignerProvider implements SignerProvider<MetaMaskSigner, "secp256k1", undefined> {
    async getSigner(identifier: string, _options: undefined): Promise<MetaMaskSigner> {
        const normalizedIdentifier = toChecksumAddress(identifier);

        const provider = window.ethereum;
        if (!provider) {
            throw new Error("MetaMask is not available");
        }

        return new MetaMaskSigner(provider, normalizedIdentifier);
    }
}

class MetaMaskSigner implements secp256k1Signer {
    readonly keyType = "secp256k1";
    // NOTE: MetaMask does not provide an API for getting the public key
    readonly publicKey = new secp256k1PublicKey(new Uint8Array(33));

    __provider: NonNullable<typeof window.ethereum>;
    __address: string;

    constructor(provider: NonNullable<typeof window.ethereum>, address: string) {
        this.__provider = provider;
        this.__address = address;
    }

    signSync(_payload: Uint8Array): Uint8Array {
        throw new Error("signSync is not available with MetaMask signer");
    }

    edSignSync(_payload: Uint8Array, _opts?: SignOpts | undefined): ECDSASignature {
        throw new Error("signSync is not available with MetaMask signer");
    }

    async sign(_payload: Uint8Array): Promise<Uint8Array> {
        throw new Error("Schnorr signing is not implemented for MetaMaskSigner");
    }

    async verify(_payload: Uint8Array, _signature: Uint8Array): Promise<boolean> {
        throw new Error("Schnorr verification is not implemented for MetaMaskSigner");
    }

    async edSign(payload: Uint8Array, _opts?: SignOpts | undefined): Promise<{ r: bigint; s: bigint; recovery?: number | undefined; }> {
        const hexPayload = bytesToHex(payload);

        const { chainId } = await this.__provider.getNetwork();
        const rawSignature: string = await this.__provider.request({
            method: "eth_sign",
            params: [
                this.__address,
                hexPayload,
            ],
        });

        const signature = rawSignature.substring(2);
        const r = BigInt("0x" + signature.substring(0, 64));
        const s = BigInt("0x" + signature.substring(64, 128));
        const v = parseInt(signature.substring(128, 130), 16);

        // Reverse of (recovery + 35n + BigInt(chainId) * 2n)
        const recovery = Number(BigInt(v) - 35n - (chainId / 2n));

        return {
            r,
            s,
            recovery,
        };
    }

    ethereumAddress(): string {
        return this.__address;
    }
}
