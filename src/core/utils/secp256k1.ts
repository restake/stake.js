
import { secp256k1 } from "@noble/curves/secp256k1";

const Fp = secp256k1.CURVE.Fp.ORDER;
const exponent = (Fp + 1n) / 4n;

export function decompressSecp256k1PublicKey(compressed: string): string {
    const prefix = BigInt(`0x${compressed.slice(0, 2)}`);
    const xValue = BigInt(`0x${compressed.slice(2)}`);

    const yValuesSq = (xValue ** 3n + 7n) % Fp;
    let yValue = modularExpo(yValuesSq, exponent, Fp);

    // Make sure that the correct y value is calculated based on the prefix (2 even, 3 odd)
    const prefixEven = prefix === 2n;
    const yEven = yValue % 2n === 0n;
    if (prefixEven !== yEven) {
        yValue = (Fp - yValue) % Fp;
    }

    const xHex = xValue.toString(16).padStart(64, "0");
    const yHex = yValue.toString(16).padStart(64, "0");

    return `04${xHex}${yHex}`;
}

export function compressSecp256k1PublicKey(decompressed: string): string {
    const prefix = BigInt(`0x${decompressed.slice(0, 2)}`);
    if (prefix !== 0x4n) {
        throw new Error("Expected decompressed public key");
    }

    const noprefix = decompressed.slice(2);
    const a = BigInt(`0x${noprefix.slice(0, 64)}`);
    const b = BigInt(`0x${noprefix.slice(64)}`);

    return `${b % 2n == 0n ? "02" : "03"}${a.toString(16)}`;
}

function modularExpo(x: bigint, y: bigint, p: bigint): bigint {
    let result = 1n;
    while (y > 0n) {
        if (y % 2n === 1n){
            result = (result * x) % p;
        }

        x = (x ** 2n) % p;
        y = y / 2n;
    }

    return result;
}
