import { ed25519PrivateKey, ed25519Signer } from "../../signer/index.js";
import { NEARSigner, networks } from "./index.js";

import { describe, expect, test } from "@jest/globals";
import { hexToBytes } from "@noble/curves/abstract/utils";

const privateKeys = [
    {
        privateKey: "bad6dd621c36144d87916f9f86d3426894f41dc324c1535991629fe8400ebce3",
        providedAccountId: "mikroskeem.testnet",
        expectedAccountId: "mikroskeem.testnet",
        expectedPublicKey: "ed25519:36JfkosUH6CUQuxwfBBVbbY9DrpMKFewgKPi1x7Gtkse"
    },
    {
        privateKey: "96997c8a4b398b83398cdc36574aab755f39b34af1fd886ae717d6b9136cc4b1",
        expectedAccountId: "fc605798163319d9b2a13e9106d4589de227dc2eb24779b87eeb1475a1979794",
        expectedPublicKey: "ed25519:HzAwq76L97DmhzgFTcvPH6UY2QqhAVG2HzC43UM2AARh"
    },
    {
        privateKey: "bf6a33877549a76bb3c93faeb11b272ff1de96a99be82f7bc0c6afa3c8ff4ed2",
        expectedAccountId: "41e66772de94e32d33e7dec57231433a31cdf922a79f8be6986967e834146a16",
        expectedPublicKey: "ed25519:5SFGiKuRUgYZ1QZLRP9ARj9QpeZ5fmJ5YAxAH5Wr1Cnh"
    },
];

describe("NEAR signer", () => {
    test.each(privateKeys)("signer construction", ({ privateKey, providedAccountId, expectedAccountId, expectedPublicKey }) => {
        const privateKeyBytes = hexToBytes(privateKey);
        const edSigner = new ed25519Signer(new ed25519PrivateKey(privateKeyBytes));
        const signer = new NEARSigner(edSigner, providedAccountId, networks["mainnet"]);

        expect(signer.nearPublicKey.toString()).toBe(expectedPublicKey);
        expect(signer.accountId).toBe(expectedAccountId);
    });
});
