import { PROTOCOL, NetworkConfig, Signature, SignerWallet, RawTransaction, Protocol } from "@restake/stake.js-core";
import { FireblocksSDK, PeerType, TransactionOperation, TransactionStatus } from "fireblocks-sdk";


function createMapEntry<P extends Protocol>(
    config: NetworkConfig<P>,
    value: string,
): [string, string] {
    const key = `${config.protocol}-${config.network.name}`;

    return [key, value];
}

const fbProtocolMapping  = new Map<string, string>([
    createMapEntry({ protocol: PROTOCOL.ETHEREUM, network: { name: "mainnet" } }, "ETH"),
    createMapEntry({ protocol: PROTOCOL.ETHEREUM, network: { name: "goerli" } }, "ETH_TEST3"),
    createMapEntry({ protocol: PROTOCOL.NEAR_PROTOCOL, network: { name: "mainnet" } }, "NEAR"),
    createMapEntry({ protocol: PROTOCOL.NEAR_PROTOCOL, network: { name: "testnet" } }, "NEAR_TEST"),
]);

export class FireblocksWallet implements SignerWallet {
    fb: FireblocksSDK;
    vaultId: string;

    constructor(apiKey: string, apiSecret: string, vaultId: string) {
        this.fb =  new FireblocksSDK(apiSecret, apiKey);
        this.vaultId = vaultId;
    }

    getFbNetworkId(networkConfig: NetworkConfig<Protocol>): string {
        const key = `${networkConfig.protocol}-${networkConfig.network.name}`;
        const fbNetworkId =  fbProtocolMapping.get(key);
        if (!fbNetworkId) {
            throw new Error(`Fireblocks network id not found for ${networkConfig.protocol} ${networkConfig.network.name}`);
        }

        return fbNetworkId;
    }

    async getAddress(networkConfig: NetworkConfig<Protocol>, selector?: string): Promise<string> {
        try {
            const index = parseInt(selector || "0");
            const args = {
                assetId: this.getFbNetworkId(networkConfig),
                vaultAccountId: parseInt(this.vaultId),
                change: 0,
                addressIndex: index,
                compressed: false ,
            };
            const pubKey = await this.fb.getPublicKeyInfoForVaultAccount(args);

            return pubKey.publicKey;
        } catch (e) {
            console.error(e);
            throw e;
        }

    }

    async getPublicKey(_networkConfig: NetworkConfig<Protocol>, _selector?: string): Promise<string> {
        throw new Error("Cannot get public key from Fireblocks.");
    }

    async sign<P extends Protocol>(
        rawTx: RawTransaction<P>,
        networkConfig: NetworkConfig<P>,
        selector?: string,
    ): Promise<Signature> {

        const txHash = rawTx.getHashBytes();

        const payload = {
            rawMessageData: {
                messages: [{
                    content: Buffer.from(txHash).toString("hex"),
                }],
            },
        };

        console.log(payload);

        const fireblocksTx = await this.fb.createTransaction({
            assetId: this.getFbNetworkId(networkConfig),
            operation: TransactionOperation.RAW,
            source: {
                type: PeerType.VAULT_ACCOUNT,
                id: this.vaultId,
            },
            extraParameters: payload,
        });

        console.log(fireblocksTx);

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

        const sig = tx.signedMessages![index].signature;

        const signature = {
            data: Buffer.from(sig.fullSig, "hex"),
            r: sig.r,
            s: sig.s,
            v: sig.v,
        };

        return signature;
    }
}
