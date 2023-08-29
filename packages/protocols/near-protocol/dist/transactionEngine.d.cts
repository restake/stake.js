import { Near } from 'near-api-js';
import { NearProtocolNetworkConfig, NearProtocolNetwork, NearProtocolRawTransaction, NearProtocolSignedTransaction } from './types.cjs';
import { TransactionEngine, NearProtocol, SignerWallet } from '@restake/stakejs-core';
import './constants.cjs';

declare class NearProtocolTransactionEngine implements TransactionEngine<NearProtocol> {
    rpcUrl: URL;
    networkConfig: NearProtocolNetworkConfig;
    near?: Near;
    constructor(network?: NearProtocolNetwork, rpcUrl?: URL);
    init(): Promise<void>;
    getNear(): Promise<Near>;
    private buildAction;
    private buildTransaction;
    buildStakeTx(wallet: SignerWallet, validator: string, amount: number, accountId?: string, selector?: string): Promise<NearProtocolRawTransaction>;
    buildUnstakeTx(wallet: SignerWallet, validator: string, amount: number | "all", accountId?: string, selector?: string): Promise<NearProtocolRawTransaction>;
    buildWithdrawTx(wallet: SignerWallet, validator: string, amount: number | "all", accountId?: string, selector?: string): Promise<NearProtocolRawTransaction>;
    sign(wallet: SignerWallet, rawTx: NearProtocolRawTransaction, selector?: string | undefined): Promise<NearProtocolSignedTransaction>;
    broadcast(signedTx: NearProtocolSignedTransaction): Promise<string>;
}

export { NearProtocolTransactionEngine };
