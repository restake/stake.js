# stake.js

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/restake/stake.js/tree/master.svg?style=shield&circle-token=8de591d088f23c001c417fdc7228ddb6e688878d)](https://dl.circleci.com/status-badge/redirect/gh/restake/stake.js/tree/master)

The goal of `stake.js` is to help developers easily integrate Proof-of-Stake staking functions into Web3 applications. We have removed the complexity involved with implementing such processes, and aim to provide users with an easy to use high-level API that "just works".

**Disclaimer: this library is in active development.**

## Dependencies

- [Node.js](https://nodejs.org/en) – `>= 18.15.x`
- [pnpm](https://pnpm.io/)

## Usage and Example

```sh
pnpm add @restake/stake.js
```

An example use-case for staking tokens on NEAR Protocol to a staking pool:

```typescript
import { StakingService, Wallet } from "@restake/stake.js";
import { FilesystemWallet } from "@restake/stake.js/wallet/filesystem";

const wallet: Wallet = new FilesystemWallet("key.json");

const rstk = new StakingService("testnet");
const txId = await rstk.near.stake(wallet, "shurik.pool.f863973.m0", "0.1");
console.log("txId", txId);
```

## Supported Protocols

- Avalanche
- Ethereum
- NEAR Protocol
- Sui

_This list is not final, as we are constantly working on adding support for additional protocols._

## Design and Features

Behind the scenes, the library does the heavy lifting on the following key areas:

- Managing connection to the blockchain network
- Transaction signing and broadcasting
    - Protocol-specific `stake`, `deposit`, `unstake`, `withdraw` and `claim` operations
- Handling integrations with custodial solutions, such as [Fireblocks](https://www.fireblocks.com)

We also aim to keep the library as lightweight as possible by implementing common functionalities (such as various elliptic curve signers) into our core SDK. Our signers mainly rely on audited modular cryptographic libraries, such as [`@noble/curves`](https://github.com/paulmillr/noble-curves) and [`@noble/hashes`](https://github.com/paulmillr/noble-hashes). Whenever we can, we aim to use libraries that support tree-shaking to decrease package size during bundling.

## Contributing

If you find an issue or want to suggest improvements, feel free to open a pull request.

## License

MIT

