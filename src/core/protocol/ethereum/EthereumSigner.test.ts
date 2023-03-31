import { secp256k1PrivateKey, secp256k1Signer } from "../../signer/index.js";
import { networks, EthereumSigner } from "./index.js";

import { describe, expect, test } from "@jest/globals";
import { hexToBytes } from "@noble/curves/abstract/utils";

const testAccounts = [
    {privateKey: "0x63f51a686d55844eb07274ec68bae4929ef3f97209199cc281a2e125e95338c3", address: "0x133afc1CD3dB58827cFb2c5eDC691770f2C3Ae5B"},
    {privateKey: "0x0564e87f03d297ff558cb841c8884f1df9b581120684040408c11908044e37d5", address: "0xB400cF0E5D79a689B53aa2E63a9B76Faef973795"},
    {privateKey: "0x09b06324b2b19527c453af77588b3f18c3a6e17afceec480db4a892734f6e414", address: "0xa3389A9F50C72A266c4605C0947B91D13e805D60"},
];

function constructSigner(privateKey: Uint8Array): EthereumSigner {
    const signer = new secp256k1Signer(new secp256k1PrivateKey(privateKey));
    const ethSigner = new EthereumSigner(signer, networks["mainnet"]);
    return ethSigner;
}

describe("Ethereum signer", () => {
    test.each(testAccounts)("derives address '$address' correctly", async ({ privateKey, address }) => {
        const bytes = hexToBytes(privateKey.startsWith("0x") ? privateKey.substring(2) : privateKey);
        const ethSigner = constructSigner(bytes);

        await expect(ethSigner.getAddress()).resolves.toBe(address);
    });
});
