import { ed25519PrivateKey, ed25519PublicKey, ed25519Signer } from "./index.js";

import { describe, expect, test } from "@jest/globals";
import { hexToBytes } from "@noble/curves/abstract/utils";
import { ed25519 } from "@noble/curves/ed25519";

const privateKeys = [
    { privateKey: "bad6dd621c36144d87916f9f86d3426894f41dc324c1535991629fe8400ebce3" },
    { privateKey: "96997c8a4b398b83398cdc36574aab755f39b34af1fd886ae717d6b9136cc4b1" },
    { privateKey: "bf6a33877549a76bb3c93faeb11b272ff1de96a99be82f7bc0c6afa3c8ff4ed2" },
];

describe("ed25519 signer", () => {
    test.each(privateKeys)("signer construction", ({ privateKey }) => {
        const privateKeyBytes = hexToBytes(privateKey);
        const signer: ed25519Signer = new ed25519PrivateKey(privateKeyBytes);

        const pk1 = signer.publicKey.bytes;
        const pk2 = ed25519.getPublicKey(privateKeyBytes);
        expect(pk1.length).toEqual(ed25519PublicKey.PUBLIC_KEY_SIZE);
        expect(pk2.length).toEqual(ed25519PublicKey.PUBLIC_KEY_SIZE);
        expect(pk1).toStrictEqual(pk2);
    });
});
