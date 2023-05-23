import { secp256k1PrivateKey, secp256k1PublicKey } from "./index.js";

import { describe, expect, test } from "@jest/globals";
import { hexToBytes } from "@noble/curves/abstract/utils";
import { secp256k1 } from "@noble/curves/secp256k1";

const privateKeys = [
    { privateKey: "264d219e5d11dd52851bd8931672a05c64a065bf727752646377458694db4251" },
    { privateKey: "ccbb6c5994d4e61be7bfac18c56ac69f46c13fe7662202de0bcbb05f1815f811" },
    { privateKey: "a916fac72ddb44fac2aad685bc616f62ace1ae0e8cf1c3a6daf528da45163180" },
];

describe("secp256k1 signer", () => {
    test.each(privateKeys)("signer construction", ({ privateKey }) => {
        const privateKeyBytes = hexToBytes(privateKey);
        const signer = new secp256k1PrivateKey(privateKeyBytes);

        const pk1 = signer.publicKey.bytes;
        const pk2 = secp256k1.getPublicKey(privateKeyBytes, true);
        expect(pk1.length).toEqual(secp256k1PublicKey.COMPRESSED_PUBLIC_KEY_SIZE);
        expect(pk2.length).toEqual(secp256k1PublicKey.COMPRESSED_PUBLIC_KEY_SIZE);
        expect(pk1).toStrictEqual(pk2);

        const cpk1 = signer.publicKey.uncompressedBytes;
        const cpk2 = secp256k1.getPublicKey(privateKeyBytes, false);
        expect(cpk1.length).toEqual(secp256k1PublicKey.UNCOMPRESSED_PUBLIC_KEY_SIZE);
        expect(cpk2.length).toEqual(secp256k1PublicKey.UNCOMPRESSED_PUBLIC_KEY_SIZE);
        expect(cpk1).toStrictEqual(cpk2);
    });
});
