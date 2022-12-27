# Staking SDK

This Software Development Kit provides functions to easily stake multiple cryptocurrencies from various custodian and wallets.

As a custody provider, it can be easily extended to quickly enable one-click staking in your customer facing platform. Feel free to contact us at contact@restake.net to discuss such an integration.

## Example

The following example shows how to build, sign and broadcast a NEAR staking transaction on testnet using a `StringWallet` , i.e. a private key stored in the environment variables.

```
import { StringWallet, StakingService } from 'staking-sdk'; 

const stk = new StakingService('testnet');

const wallet = new StringWallet();

const accountId = 'maxrutag.testnet';
const validator = 'shurik.pool.f863973.m0';
const amount = 0.5;

const tx = await stk.near.buildStakeTransaction(accountId, validator, amount);
console.log(tx);

const txSigned = stk.near.signTransaction(tx, wallet, 'NEAR_PRIVATE_KEY');
console.log(txSigned);

const txId = await stk.near.broadcastTransaction(txSigned);
console.log(txId);
```