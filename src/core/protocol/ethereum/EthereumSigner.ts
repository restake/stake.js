import { BlockFinality } from "./network.js";
import { EthereumNetwork } from "./network.js";
import { jsonrpc } from "../../utils/http.js";
import { secp256k1Signer } from "../../signer/secp256k1Signer.js";
import { Transaction, SignedTransaction } from "./EthereumTransaction.js";
import { TransactionSigner } from "../../signer/TransactionSigner.js";

import { bytesToHex } from "@noble/curves/abstract/utils";
import { keccak_256 } from "@noble/hashes/sha3";
import { Transaction as EthTransaction } from "@ethereumjs/tx";

export type EthereumBlockResponse = {
    number: string;
    gasLimit: string;
};

export class EthereumSigner implements TransactionSigner<Transaction, SignedTransaction>  {
    #parent: secp256k1Signer;
    #network: EthereumNetwork;

    constructor(parent: secp256k1Signer, network: EthereumNetwork) {
        this.#parent = parent;
        this.#network = network;
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        const message = transaction.payload.getMessageToSign(true);
        const { r, s, recovery } = await this.#parent.edSign(message);

        // TODO: not sure if defaulting to 0 is fine.
        const bRecovery = recovery ? BigInt(recovery) : 0n;

        // While we'll always have chainId available, keep this condition here to
        // possibly support this use-case.
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
        return this.#network;
    }

    async fetchNonce(senderAddress: string, block: BigInt | BlockFinality = "latest"): Promise<BigInt> {
        const endpoint = new URL(this.#network.rpcUrl);
        const nonce = await jsonrpc<string>(endpoint, "eth_getTransactionCount", [
            senderAddress,
            typeof block === "bigint" ? "0x" + block.toString(16) : block,
        ]);

        return BigInt(nonce);
    }

    async fetchGasPrice(): Promise<BigInt> {
        const endpoint = new URL(this.#network.rpcUrl);
        const gasPrice = await jsonrpc<string>(endpoint, "eth_gasPrice", []);

        return BigInt(gasPrice);
    }

    async fetchBlock(block: BigInt | BlockFinality): Promise<EthereumBlockResponse> {
        const endpoint = new URL(this.#network.rpcUrl);
        return jsonrpc<EthereumBlockResponse>(endpoint, "eth_getBlockByNumber", [
            typeof block === "bigint" ? "0x" + block.toString(16) : block,
            false,
        ]);
    }

    getAddress(checksum: boolean = true): string {
        // Ethereum address derivation requires the removal of the first x04 byte
        const publicKeyBytes = this.#parent.publicKey.bytes.slice(1);
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

        // target [a; f]
        if (code >= 97 && code <= 102) {
            const nibble = parseInt(addressHash[i], 16);
            computedAddress += nibble > 7 ? chr.toUpperCase() : chr;
        } else {
            computedAddress += chr;
        }
    }

    return "0x" + computedAddress;
}
