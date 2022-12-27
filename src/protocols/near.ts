import { Network } from '../networks';
import { Protocol } from './protocol';
import { Wallet } from '../wallets/wallet';

import { sha256 } from 'js-sha256'; 
import BN from 'bn.js';

// NEAR API imports
import * as nearAPI from 'near-api-js';
import { Action, functionCall, Signature, SignedTransaction, Transaction } from 'near-api-js/lib/transaction';
import { PublicKey } from 'near-api-js/lib/utils';
import { AccessKeyInfoView, FinalExecutionOutcome } from 'near-api-js/lib/providers/provider';
import { Account, connect, Near, transactions } from 'near-api-js';

const MAX_GAS: number = 300e12;

export enum NearStakingMethods {
    stake = 'deposit_and_stake',
    unstake = 'unstake',
    withdraw = 'withdraw',
    unstakeAll =  'unstake_all',
    withdrawAll = 'withdraw_all'
};

function getBN(nearAmount: number): BN {
    const yoctoAmount: string | null = nearAPI.utils.format.parseNearAmount(nearAmount.toString());
    if (!yoctoAmount) {
        throw new Error(`Unable to parse NEAR amount ${nearAmount}`);
    }
    const bnAmount: BN =  new BN(yoctoAmount);
    return bnAmount;
}

export class NearProtocol extends Protocol {
    near: Near | undefined = undefined;
    
    constructor(network: Network) {
        super(network);
    }

    async init() {
        this.near = await connect({
            networkId: this.network,
            nodeUrl: `https://rpc.${this.network}.near.org`
        });
    }

    async getNear(): Promise<Near> {
        if (this.near === undefined) {
            await this.init();
        }
        return this.near as Near;
    }

    buildStakingAction(method: NearStakingMethods, amount?: number): Action {
        let action: Action;

        switch (method) {
            case NearStakingMethods.stake:
                if (typeof amount === 'undefined') {
                    throw new Error('You need to specify an amount to stake.');
                } else {
                    action = functionCall(method, {}, new BN(MAX_GAS), getBN(amount));
                }  
                break;
            case NearStakingMethods.unstake :
            case NearStakingMethods.withdraw:
                if (typeof amount === 'undefined') {
                    throw new Error(`You need to specify an amount to ${method}.`);
                } else {
                    action = functionCall(method, { amount: nearAPI.utils.format.parseNearAmount(amount.toString()) }, new BN(MAX_GAS), getBN(0));
                } 
                break;
            case NearStakingMethods.unstakeAll:
            case NearStakingMethods.withdrawAll:
                action = functionCall(method, {}, new BN(MAX_GAS), getBN(0));
                break;
            default:
                throw new Error(`Unknwon method ${method}.`);
        }
        return action;
    }

    private async buildTransaction(method: NearStakingMethods, accountId: string, validator: string, amount?: number): Promise<Transaction> {
        const near: Near = await this.getNear();
        const account: Account = await near.account(accountId);
        const accessKeys: AccessKeyInfoView[] = await account.getAccessKeys();
        const fullAccessKey: AccessKeyInfoView | undefined = accessKeys.find(accessKey => accessKey.access_key.permission === 'FullAccess');

        if(!fullAccessKey) {
            throw new Error(`Could not find Full Access Key for account [ ${accountId} ]`);
        }

        const publicKey: PublicKey = PublicKey.from(fullAccessKey.public_key);

        const nonce: BN = fullAccessKey.access_key.nonce.add(new BN(1));

        const actions: Array<Action> = [this.buildStakingAction(method, amount)]

        const accessKey = await near.connection.provider.query(`access_key/${ accountId }/${ publicKey.toString() }`, '');
        const recentBlockHash = nearAPI.utils.serialize.base_decode(accessKey.block_hash);

        const rawTx: Transaction = nearAPI.transactions.createTransaction(accountId, publicKey, validator, nonce, actions, recentBlockHash);

        return rawTx;
    }

    async buildStakeTransaction(accountId: string, validator: string, amount: number): Promise<Transaction> {
        return await this.buildTransaction(NearStakingMethods.stake, accountId, validator, amount);
    }

    async buildUnstakeTransaction(accountId: string, validator: string, amount?: number): Promise<Transaction> {
        if (!amount) {
            return await this.buildTransaction(NearStakingMethods.unstakeAll, accountId, validator);
        } else {
            return await this.buildTransaction(NearStakingMethods.unstake, accountId, validator, amount);
        }
    }

    async buildWithdrawTransaction(accountId: string, validator: string, amount?: number): Promise<Transaction> {
        if (!amount) {
            return await this.buildTransaction(NearStakingMethods.withdrawAll, accountId, validator);
        } else {
            return await this.buildTransaction(NearStakingMethods.withdraw, accountId, validator, amount);
        }
    }

    getTxHash(rawTx: Transaction): Uint8Array {
        const serializedTx: Uint8Array = nearAPI.utils.serialize.serialize(transactions.SCHEMA, rawTx);
        const txHash: Uint8Array = new Uint8Array(sha256.array(serializedTx));
        return txHash;
    }

    buildSignedTransaction(rawTx: Transaction, signature: Signature): SignedTransaction {
        const signedTx: SignedTransaction = new nearAPI.transactions.SignedTransaction({
            transaction: rawTx,
            signature: signature
        });
        return signedTx;
    }

    signTransaction(rawTx: Transaction, wallet: Wallet, vault: string): SignedTransaction {
        const txHash: Uint8Array = this.getTxHash(rawTx);

        const signatureArray: Uint8Array = wallet.signTxHash(txHash, 'near', vault);
        const signature = new nearAPI.transactions.Signature({
            keyType: rawTx.publicKey.keyType,
            data: signatureArray
        });

        const signedTx: SignedTransaction = this.buildSignedTransaction(rawTx, signature);

        return signedTx;
    }

    async broadcastTransaction(signedTx: SignedTransaction): Promise<string> {
        try {
            const near: Near = await this.getNear();
            const result: FinalExecutionOutcome = await near.connection.provider.sendTransaction(signedTx);
            console.log('Transaction Results: ', result.transaction);
            console.log('--------------------------------------------------------------------------------------------');
            console.log('OPEN LINK BELOW to see transaction in NEAR Explorer!');
            console.log(`$https://explorer.${this.network}.near.org/transactions/${result.transaction.hash}`);
            console.log('--------------------------------------------------------------------------------------------');

            return result.transaction.hash;
        } catch(error) {
            console.log('An error occurred while trying to broadcast the transaction.');
            throw error;
        }
    }
}