# Staking SDK

This Software Development Kit provides functions to easily stake multiple cryptocurrencies from various custody and wallet solutions.

As a custody provider, it can be easily extended to quickly enable one-click staking in your customer facing platform. Feel free to contact us at contact@restake.net to discuss such an integration.

## Example

The following example shows how to build, sign and broadcast a NEAR staking transaction on testnet using a `StringWallet` , i.e. a private key stored in the environment variables.

```
import { StringWallet, StakingService } from 'staking-sdk'; 

const network = 'testnet';
const stk = new StakingService(network);

const stringWallet = new StringWallet([{
    id: 'near-staking-sdk-testnet',
    address: 'staking-sdk.testnet',
    privateKeyVarname: 'NEAR_PRIVATE_KEY',
    protocol: 'near-protocol',
    network: 'testnet'
}]);

const wallet = stringWallet;
const vaultId = 'near-staking-sdk-testnet'

const validator = 'shurik.pool.f863973.m0';
const amount = 0.5;

const tx = await stk.near.buildStakeTransaction(wallet, vaultId, validator, amount);
console.log(tx);

const txSigned = await stk.near.signTransaction(wallet, vaultId, tx);
console.log(txSigned);

const txId = await stk.near.broadcastTransaction(txSigned);
console.log(txId);
```

Examples can be found in the *examples* folder and can be run with the following commands:

```
yarn install
yarn run build
yarn run start-${protocol}
```
