import { secp256k1PrivateKey, secp256k1Signer } from "../../signer/index.js";
import { networks, EthereumSigner, toChecksumAddress } from "./index.js";

import { describe, expect, test } from "@jest/globals";
import { hexToBytes } from "@noble/curves/abstract/utils";

const testAccounts = [
    { privateKey: "0x63f51a686d55844eb07274ec68bae4929ef3f97209199cc281a2e125e95338c3", address: "0x133afc1CD3dB58827cFb2c5eDC691770f2C3Ae5B" },
    { privateKey: "0x0564e87f03d297ff558cb841c8884f1df9b581120684040408c11908044e37d5", address: "0xB400cF0E5D79a689B53aa2E63a9B76Faef973795" },
    { privateKey: "0x09b06324b2b19527c453af77588b3f18c3a6e17afceec480db4a892734f6e414", address: "0xa3389A9F50C72A266c4605C0947B91D13e805D60" },
];

const testAddresses = [
    // all caps
    { address: "0x52908400098527886E0F7030069857D2E4169EE7" },
    { address: "0x8617E340B3D01FA5F11F306F4090FD50E238070D" },
    // all lower
    { address: "0xde709f2102306220921060314715629080e2fb77" },
    { address: "0x27b1fdb04752bbc536007a920d24acb045561c26" },
    // normal, mixed case
    { address: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed" },
    { address: "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359" },
    { address: "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB" },
    { address: "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb" },
];

function constructSigner(privateKey: Uint8Array): EthereumSigner {
    const signer = new secp256k1Signer(new secp256k1PrivateKey(privateKey));
    const ethSigner = new EthereumSigner(signer, networks["mainnet"]);
    return ethSigner;
}

describe("Ethereum signer", () => {
    test.each(testAccounts)("derives address '$address' correctly", ({ privateKey, address }) => {
        const bytes = hexToBytes(privateKey.startsWith("0x") ? privateKey.substring(2) : privateKey);
        const ethSigner = constructSigner(bytes);

        expect(ethSigner.getAddress()).toBe(address);
    });
});

describe("Checksum address computing", () => {
    // Expecting output to equal to input
    test.each(testAddresses)("computes checksum address '$a' correctly", ({ address }) => {
        expect(toChecksumAddress(address)).toBe(address);
    });
});
