# stake.js examples

```shell
$ pnpm ts-node src/ethereum/core/fireblocks.ts
$ pnpm ts-node src/near/highlevel/filesystem.ts
```

See [src/](src/) for specific examples


## Getting started with Fireblocks wallet examples

You need to fill in following files:
- `keys/fireblocks-account.txt` - Vault account ID obtained from Fireblocks console (`https://console.fireblocks.io/v2/accounts/vault/${number}`)
- `keys/fireblocks-api-key.txt` - Fireblocks API key
- `keys/fireblocks-secret.pem` - Fireblocks API secret (PEM file, starting with `-----BEGIN PRIVATE KEY-----`)

## Getting started with filesystem wallet examples

You need to fill in `keys/key.json` with following structure:

```json
[
    {
        "protocol": "near",
        "keyType": "ed25519",
        "privateKey": "hex encoded ed25519 private key",
        "accountId": null, // or e.g. "restake.near"
    },
    {
        "protocol": "ethereum",
        "keyType": "secp256k1",
        "privateKey": "hex encoded secp256k1 private key",
        "accountId": null, // can be omitted, irrelevant for Ethereum
    }
]
```
