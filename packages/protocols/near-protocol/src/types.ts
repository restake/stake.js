import { Network, NetworkConfig, PROTOCOL, NearProtocol, RawTransaction, SignedTransaction, Signature } from "@restake/stakejs-core";
import { NEAR_PROTOCOL_NETWORKS } from "./constants.ts";
import * as nearApi from "near-api-js";
import { sha256 } from "js-sha256";

export type NearProtocolNetwork = Network<NearProtocol> & { name: typeof NEAR_PROTOCOL_NETWORKS[keyof typeof NEAR_PROTOCOL_NETWORKS] };

export type NearProtocolNetworkConfig = NetworkConfig<NearProtocol> & { network: NearProtocolNetwork };

export class NearProtocolRawTransaction implements RawTransaction<NearProtocol> {
    protocol: NearProtocol = PROTOCOL.NEAR_PROTOCOL;
    transaction: nearApi.transactions.Transaction;

    constructor(tx: nearApi.transactions.Transaction) {
        this.transaction = tx;
    }

    serialize(): string {
        return Buffer.from(this.transaction.encode()).toString("hex");
    }

    getBytes(): Uint8Array {
        return this.transaction.encode();
    }

    getHash(): string {
        return sha256(this.transaction.encode());
    }

    getHashBytes(): Uint8Array {
        return new Uint8Array(sha256.array(this.transaction.encode()));
    }

}

export class NearProtocolSignedTransaction implements SignedTransaction<NearProtocol> {
    protocol: NearProtocol = PROTOCOL.NEAR_PROTOCOL;
    transaction: nearApi.transactions.SignedTransaction;

    constructor(rawTx: nearApi.transactions.Transaction, signature: Signature) {
        const nearApiSignature = new nearApi.transactions.Signature({
            keyType: rawTx.publicKey.keyType,
            data: signature.data,
        });
        const nearApiSignedTx = new nearApi.transactions.SignedTransaction({
            transaction: rawTx,
            signature: nearApiSignature,
        });
        this.transaction = nearApiSignedTx;
    }
}
