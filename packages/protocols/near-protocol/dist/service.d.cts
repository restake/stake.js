import './constants.cjs';
import { ProtocolService, SignerWallet } from '@restake/stakejs-core';
import { NearProtocolTransactionEngine } from './transactionEngine.cjs';
import { NearProtocolNetwork } from './types.cjs';
import 'near-api-js';

declare class NearProtocolService extends ProtocolService<NearProtocolTransactionEngine> {
    tx: NearProtocolTransactionEngine;
    constructor(network?: NearProtocolNetwork, rpcUrl?: URL);
    stake(wallet: SignerWallet, validator: string, amount: number, accountId?: string, selector?: string): Promise<string>;
    withdraw(wallet: SignerWallet, validator: string, amount: number | "all", accountId?: string, selector?: string): Promise<string>;
    unstake(wallet: SignerWallet, validator: string, amount: number | "all", accountId?: string, selector?: string): Promise<string>;
}

export { NearProtocolService };
