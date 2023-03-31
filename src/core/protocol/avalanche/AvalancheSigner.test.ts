import { secp256k1PrivateKey, secp256k1Signer } from "../../signer/index.js";
import { AvalancheSigner, networks } from "./index.js";

import { describe, expect, test } from "@jest/globals";
import { BinTools } from "avalanche";

const privateKeys = [
    {
        privateKey: "PrivateKey-HsMbk4ftVUqNbQ53cEdGTcou2tCMAYjHq6aNAGgPtEH9yWQvC",
        expectedAddress: "P-fuji184jcgj3y4t0c8ja0e246ghkcqc26wp3pns4gkf",
    },
    {
        privateKey: "PrivateKey-2ZAcDtD2Mft3a9qaF9DVs9Bet4sH1TAKyRpUMXim3CG1X2QEpQ",
        expectedAddress: "P-fuji1ux4zq7w9ylyq96cp27gk3dkpvzffr8xazm3x59",
    },
    {
        privateKey: "PrivateKey-2HUAvWtsb7LdbapXZcwwxdReyTZ4ruwyjjdASQ3czWs8UDsPZX",
        expectedAddress: "P-fuji13qfrmjhr69jdnnyxvlywx20yj8n2v5u9etu5l0",
    },
    {
        privateKey: "PrivateKey-ntFeL5b3raNyEZ2VJro7oEj2WHAvkkoG4xRPABmdKV8mW8yGL",
        expectedAddress: "P-fuji15t0akjk9mr8qspg2295a6uxq63ycmnxryycjdz",
    },
];

describe("Avalanche signer", () => {
    test.each(privateKeys)("signer construction", async ({ privateKey, expectedAddress }) => {
        const privateKeyBytes = BinTools.getInstance().cb58Decode(privateKey.replace("PrivateKey-", ""));

        const edSigner = new secp256k1Signer(new secp256k1PrivateKey(privateKeyBytes));
        const signer = new AvalancheSigner(edSigner, networks["testnet"]);

        const derivedAddress = signer.deriveAddress("P");
        expect(derivedAddress).toBe(expectedAddress);
    });
});
