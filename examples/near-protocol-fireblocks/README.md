# Stake.js examples | Near / Fireblocks

Before running this example, you need to provide:
- `secrets/api-key.txt` - The API key of a Fireblocks API User that is authorized to access the Vault.
- `secrets/secret-key.txt` - The secret key of a Fireblocks API User that is authorized to access the Vault (PEM file, starting with `-----BEGIN PRIVATE KEY-----`).
- A Fireblocks Vault ID in the environment variable `FIREBLOCKS_VAULT_ID` (e.g. in `.env` file).

Then install dependencies:

```bash
pnpm install
```

And run the example:

```bash
pnpm run start
```
