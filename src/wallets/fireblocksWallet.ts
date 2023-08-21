import { SignerWallet } from "../wallets/index.ts";
import { FireblocksSDK, PeerType,TransactionOperation, TransactionStatus } from "fireblocks-sdk";
import { Protocol, RawTransaction, SignedTransaction, NetworkConfig, Ethereum, NearProtocol } from "../protocols/index.ts";
import { PROTOCOL } from "../protocols/constants.ts";
import { Transaction, getBytes } from "ethers";
import * as nearApi from "near-api-js";
import { sha256 } from "js-sha256";


function createMapEntry<P extends Protocol>(config: NetworkConfig<P>, value: string): [NetworkConfig<P>, string] {
    return [config, value];
}

const fbProtocolMapping  = new Map<NetworkConfig<Protocol>, string>([
    createMapEntry({ protocol: PROTOCOL.ETHEREUM, network: "mainnet" }, "ETH_MAIN"),
    createMapEntry({ protocol: PROTOCOL.ETHEREUM, network: "goerli" }, "ETH_TEST3"),
    createMapEntry({ protocol: PROTOCOL.NEAR_PROTOCOL, network: "mainnet" }, "NEAR_MAIN"),
    createMapEntry({ protocol: PROTOCOL.NEAR_PROTOCOL, network: "testnet" }, "NEAR_TEST"),
]);

type FireblocksSignature = {
    fullSig: string;
    r?: string | undefined;
    s?: string | undefined;
    v?: number | undefined;
}

export class FireblocksWallet implements SignerWallet {
    fb: FireblocksSDK;
    vaultId: string;

    constructor(apiKey: string, apiSecret: string, vaultId: string) {
        this.fb =  new FireblocksSDK(apiSecret, apiKey);
        this.vaultId = vaultId;
    }

    getFbNetworkId(network: NetworkConfig<Protocol>): string {
        const fbNetworkId =  fbProtocolMapping.get(network);
        if (!fbNetworkId) {
            throw new Error(`Fireblocks network id not found for ${network.protocol} ${network.network}`);
        }

        return fbNetworkId;
    }

    async getAddress<P extends Protocol>(network: NetworkConfig<P>, selector?: string): Promise<string> {
        const addresses = await this.fb.getDepositAddresses(this.vaultId, this.getFbNetworkId(network));
        const index = parseInt(selector || "0");
        const address = addresses[index];

        if (!address) {
            throw new Error("No address returned!");
        }

        return address.address;
    }

    async getPublicKey<P extends Protocol>(_network: NetworkConfig<P>, _selector?: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    async signTxHash<P extends Protocol>(
        txHash: Uint8Array,
        networkConfig: NetworkConfig<P>,
        selector?: string,
    ): Promise<FireblocksSignature> {

        const payload = {
            rawMessageData: {
                messages: [{
                    content: Buffer.from(txHash).toString("hex"),
                }],
            },
        };

        const fireblocksTx = await this.fb.createTransaction({
            assetId: fbProtocolMapping.get(networkConfig),
            operation: TransactionOperation.RAW,
            source: {
                type: PeerType.VAULT_ACCOUNT,
                id: this.vaultId,
            },
            extraParameters: payload,
        });

        let tx = await this.fb.getTransactionById(fireblocksTx.id);
        while (tx.status != TransactionStatus.COMPLETED) {
            console.log(`Current transaction status: ${tx.status}`);
            if (
                tx.status == TransactionStatus.BLOCKED ||
                tx.status == TransactionStatus.FAILED ||
                tx.status == TransactionStatus.REJECTED ||
                tx.status == TransactionStatus.CANCELLED
            ) {
                throw Error(`Transaction was not completed | STATUS: ${tx.status}.`);
            }
            tx = await this.fb.getTransactionById(fireblocksTx.id);
            await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, 5000));
        }

        console.log(`Current transaction status: ${tx.status}`);

        const index = parseInt(selector || "0");

        const signature = tx.signedMessages![index].signature;

        return signature;
    }

    async sign<P extends Protocol>(rawTx: RawTransaction<P>, network: NetworkConfig<P>, selector?: string): Promise<SignedTransaction<P>> {
        let signedTx: SignedTransaction<P>;

        switch (network.protocol) {
        case PROTOCOL.ETHEREUM: {
            const rawEthereumTx = rawTx as RawTransaction<Ethereum>;
            const payload = getBytes(rawEthereumTx.unsignedHash);
            const signature = await this.signTxHash(payload, network, selector);
            signedTx = Transaction.from({
                ...rawEthereumTx.toJSON(),
                signature: {
                    v: "0x" + signature.v,
                    r: "0x" + signature.r,
                    s: "0x" + signature.s,
                },
            }) as SignedTransaction<Ethereum>;
            break;
        }
        case PROTOCOL.NEAR_PROTOCOL: {
            const rawNearTx = rawTx as RawTransaction<NearProtocol>;
            const payload = new Uint8Array(sha256.array(rawNearTx.encode()));
            const signature = await this.signTxHash(payload, network, selector);
            signedTx = new nearApi.transactions.SignedTransaction({
                transaction: rawNearTx,
                signature: new nearApi.transactions.Signature({
                    keyType: rawNearTx.publicKey.keyType,
                    data: signature.fullSig,
                }),
            });
            break;
        }
        default:
            throw new Error(`Ledger signing not supported for ${network.protocol}`);
        }


        return signedTx;
    }

}
