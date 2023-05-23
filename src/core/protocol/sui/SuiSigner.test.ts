import { KeyType, ed25519PrivateKey, secp256k1PrivateKey } from "../../signer/index.js";
import { SuiSigner, networks } from "./index.js";

import { describe, expect, test } from "@jest/globals";
import { hexToBytes } from "@noble/curves/abstract/utils";

const privateKeys = [
    {
        privateKey: "bad6dd621c36144d87916f9f86d3426894f41dc324c1535991629fe8400ebce3",
        keyType: "ed25519",
        expectedAddress: "0xcd63009fb37131e790684e982ec23ccba2e51aba96fa0ca4a0a018aafff1f3a8",
    },
    {
        privateKey: "96997c8a4b398b83398cdc36574aab755f39b34af1fd886ae717d6b9136cc4b1",
        keyType: "ed25519",
        expectedAddress: "0xb5d15ff56b01f7d99f95834c9d40083cb5580291dac442731ee254626ba41ba5",
    },
    {
        privateKey: "bf6a33877549a76bb3c93faeb11b272ff1de96a99be82f7bc0c6afa3c8ff4ed2",
        keyType: "ed25519",
        expectedAddress: "0x2bc9ec0b73ed5820c1fcb92a075e7f04b840038b3d94c1f09a87aa407d009bff",
    },
    {
        privateKey: "08692998848bb53213360573e49f28b62ae6588f0519f62e5c31ec8b6aa8fc26",
        keyType: "secp256k1",
        expectedAddress: "0xe030d9f745cb92cddd54eb4c75f42d8d29d61dc9048750ae1177f2a7f2a4b887",
    },
];

function constructSigner(keyType: KeyType, privateKey: Uint8Array): SuiSigner {
    const edSigner = keyType == "ed25519" ? new ed25519PrivateKey(privateKey) : new secp256k1PrivateKey(privateKey);
    const suiSigner = new SuiSigner(edSigner, networks["mainnet"]);

    return suiSigner;
}

describe("Sui signer", () => {
    test.each(privateKeys)("derives address '$expectedAddress' correctly", ({ keyType, privateKey, expectedAddress }) => {
        const privateKeyBytes = hexToBytes(privateKey);
        const signer = constructSigner(keyType, privateKeyBytes);

        const addr = signer.keyPair.getPublicKey().toSuiAddress();
        expect(addr).toBe(expectedAddress);
    });
});
