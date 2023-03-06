import { Avalanche, BinTools, Buffer, BN } from "avalanche";
import { UnsignedTx, Tx } from "avalanche/dist/apis/platformvm";
import { networks, AvalancheNetwork } from "./network";
import { AvalancheSigner } from "./AvalancheSigner";
import { createHash } from "crypto";
import { SignedTransaction, TransactionBroadcaster } from "../../network/broadcaster";


const networkName = 'testnet';

export class AvalancheProtocol implements TransactionBroadcaster<SignedTransaction, unknown> {

    broadcast(signedTransaction: unknown): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
    broadcastSimple(signedTransaction: unknown): Promise<string> {
        throw new Error("Method not implemented.");
    }

    /**
     * Constructs a staking transaction
     *
     * @param signer Avalanche signer.
     * @param validator Validator account ID
     * @param amount Amount to delegate to the validator
     * @param dateStart Starting time date-time object
     * @param dateEnd Starting time date-time object
     * @returns Unsigned transaction
     */



    async buildStakeTransaction(
        signer: AvalancheSigner,
        validator: string,
        amount: string,
        //keyPairId?: string,
        dateStart: Date,
        dateEnd: Date,
    ): Promise<UnsignedTx> {

        const pAddress: string = await signer.deriveAddress("P");
        const pChain = signer.client.PChain();
        const chainId = pChain.getBlockchainID();

        const {utxos} = await pChain.getUTXOs(pAddress, chainId);

        //const dateStart = new Date(new Date().getTime()+10000);
        //const dateEnd = new Date(dateStart.getTime()+1209600000);

        return await pChain.buildAddDelegatorTx(
            utxos,
            [pAddress],
            [pAddress],
            [pAddress],
            validator,
            new BN(dateStart.getTime()/1000),
            new BN(dateEnd.getTime()/1000),
            new BN(amount),
            [pAddress],
            new BN("2"),
            undefined,
            undefined,
            undefined,
        );
    }

}
