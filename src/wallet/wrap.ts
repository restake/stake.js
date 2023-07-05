import { SignOpts } from "@noble/curves/abstract/weierstrass";
import { ed25519PublicKey } from "../core/signer/ed25519Signer.ts";
import { ECDSASignature, secp256k1PublicKey, secp256k1Signer } from "../core/signer/index.ts";
import { PublicKey } from "../core/signer/key.ts";
import { Signer } from "../core/signer/signer.ts";
import { SignerWallet, __USING_CORE_SDK } from "./index.ts";

const wrappedSigner = Symbol();
const wrappedWallet = Symbol();

export function wrapCoreSigner<K extends string>(signer: Signer<K>): SignerWallet {
    if (wrappedWallet in signer) {
        return signer[wrappedWallet] as SignerWallet;
    }

    return Object.freeze({
        [__USING_CORE_SDK]: true,
        [wrappedSigner]: signer,

        sign(_protocol: string, data: Uint8Array): Promise<Uint8Array> {
            return signer.sign(data);
        },

        accountId(_protocol: string): Promise<string | null> {
            throw new Error();
        },

        publicKey(_protocol: string): Promise<Uint8Array> {
            return Promise.resolve(signer.publicKey.bytes);
        },

        keyType(_protocol: string): Promise<string> {
            return Promise.resolve(signer.keyType);
        },
    });
}

export async function wrapSignerWallet<K extends string>(
    keyType: K,
    protocol: string,
    wallet: SignerWallet,
): Promise<Signer<K>> {
    if (wrappedSigner in wallet) {
        return wallet[wrappedSigner] as Signer<K>;
    }

    let publicKey: PublicKey<K>;

    const signerWalletKeyType = await wallet.keyType(protocol);
    if (signerWalletKeyType !== keyType) {
        throw new Error(`Unexpected SignerWallet key type, wanted '${keyType}' but got '${signerWalletKeyType}'`);
    }

    if (signerWalletKeyType === "ed25519") {
        publicKey = new ed25519PublicKey(await wallet.publicKey(protocol)) as unknown as PublicKey<K>;
    } else if (signerWalletKeyType === "secp256k1") {
        publicKey = new secp256k1PublicKey(await wallet.publicKey(protocol)) as unknown as PublicKey<K>;
    } else {
        throw new Error(`Unsupported SignerWallet key type '${signerWalletKeyType}'`);
    }

    return Object.freeze({
        keyType,
        publicKey,
        [wrappedWallet]: wallet,

        sign(payload: Uint8Array): Promise<Uint8Array> {
            return wallet.sign(protocol, payload);
        },

        signSync(_payload: Uint8Array): Uint8Array {
            throw new Error("signSync is not supported");
        },

        verify(_payload: Uint8Array, _signature: Uint8Array): Promise<boolean> {
            throw new Error("verify is not supported");
        },

        edSign(payload: Uint8Array, opts?: SignOpts): Promise<ECDSASignature> {
            if (wrappedSigner in wallet) {
                const signer = wallet[wrappedSigner] as secp256k1Signer;

                return signer.edSign(payload, opts);
            }

            throw new Error("edSign is not supported");
        },

        edSignSync(_payload: Uint8Array, _opts?: SignOpts): ECDSASignature {
            throw new Error("edSignSync is not supported");
        },
    });
}
