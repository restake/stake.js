import { BlockFinality } from "./network.ts";
import { EthereumNetwork } from "./network.ts";
import { jsonrpc } from "../../utils/http.ts";
import { secp256k1Signer } from "../../signer/secp256k1Signer.ts";
import { Transaction, SignedTransaction } from "./EthereumTransaction.ts";
import { TransactionSigner } from "../../signer/TransactionSigner.ts";

import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils";
import { keccak_256 } from "@noble/hashes/sha3";
import { Transaction as EthTransaction } from "@ethereumjs/tx";
import { decompressSecp256k1PublicKey } from "../../utils/secp256k1.ts";

export type EthereumBlockResponse = {
    number: string;
    gasLimit: string;
};

export class EthereumSigner implements TransactionSigner<Transaction, SignedTransaction>  {
    __parent: secp256k1Signer;
    __network: EthereumNetwork;

    constructor(parent: secp256k1Signer, network: EthereumNetwork) {
        this.__parent = parent;
        this.__network = network;
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        const message = transaction.payload.getMessageToSign(true);
        const { r, s, recovery } = await this.__parent.edSign(message);

        // TODO: not sure if defaulting to 0 is fine.
        const bRecovery = recovery ? BigInt(recovery) : 0n;

        // While we'll always have chainId available, keep this condition here to
        // Possibly support this use-case.
        const chainId = transaction.network.chainId;
        const v = chainId === undefined ? bRecovery + 27n : bRecovery + 35n + BigInt(chainId) * 2n;

        // Reconstruct transaction
        const signedTxn =  EthTransaction.fromTxData({
            ...transaction.payload,
            v,
            r,
            s,
        }, {
            common: transaction.payload.common,
        });

        return {
            transaction,
            payload: signedTxn,
        };
    }

    get network(): EthereumNetwork {
        return this.__network;
    }

    async fetchNonce(senderAddress: string, block: bigint | BlockFinality = "latest"): Promise<bigint> {
        const endpoint = new URL(this.__network.rpcUrl);
        const nonce = await jsonrpc<string>(endpoint, "eth_getTransactionCount", [
            senderAddress,
            typeof block === "bigint" ? "0x" + block.toString(16) : block,
        ]);

        return BigInt(nonce);
    }

    async fetchGasPrice(): Promise<bigint> {
        const endpoint = new URL(this.__network.rpcUrl);
        const gasPrice = await jsonrpc<string>(endpoint, "eth_gasPrice", []);

        return BigInt(gasPrice);
    }

    async fetchBlock(block: bigint | BlockFinality): Promise<EthereumBlockResponse> {
        const endpoint = new URL(this.__network.rpcUrl);

        return jsonrpc<EthereumBlockResponse>(endpoint, "eth_getBlockByNumber", [
            typeof block === "bigint" ? "0x" + block.toString(16) : block,
            false,
        ]);
    }

    getAddress(checksum = true): string {
        if ("ethereumAddress" in this.__parent) {
            const fn = this.__parent.ethereumAddress as (() => string);

            return fn.call(this.__parent);
        }

        // Ethereum address derivation requires the removal of the first x04 byte
        const uncompressed = hexToBytes(decompressSecp256k1PublicKey(this.__parent.publicKey.asHex()));
        const publicKeyBytes = uncompressed.slice(1);
        const keccakBytes = keccak_256(publicKeyBytes);

        // Ethereum specification outlines that last 20 bytes of keccak256 hash are used for address derivation
        const hexAddress = bytesToHex(keccakBytes.slice(12));

        return checksum ? toChecksumAddress(hexAddress) : "0x" + hexAddress;
    }
}

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md
export function toChecksumAddress(address: string): string {
    const cleanAddress = address.toLowerCase().replace(/^0x/, "");

    const addressHash = bytesToHex(keccak_256(new TextEncoder().encode(cleanAddress)));
    let computedAddress = "";
    for (let i = 0; i < cleanAddress.length; i++) {
        const chr = cleanAddress[i];
        const code = chr.charCodeAt(0);

        // Target [a; f]
        if (code >= 97 && code <= 102) {
            const nibble = parseInt(addressHash[i], 16);
            computedAddress += nibble > 7 ? chr.toUpperCase() : chr;
        } else {
            computedAddress += chr;
        }
    }

    return "0x" + computedAddress;
}
