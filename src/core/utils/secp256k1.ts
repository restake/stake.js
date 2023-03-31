export function decompressSecp256k1PublicKey(compressedKey: string): string {
    const prefix = compressedKey.slice(0,2);
    const xValue = BigInt(`0x${compressedKey.slice(2)}`);

    const params = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
    const exponent = (params + BigInt(1)) / BigInt(4);


    const yValuesSq = (xValue ** BigInt(3) + BigInt(7)) % params;

    let yValue = modularExpo(yValuesSq, exponent, params);
    console.log(yValuesSq);

    // Make sure that the correct y value is calculated based on the prefix (02 even, 03 odd)
    if (prefix === "02" && yValue % BigInt(2) !== BigInt(0)) {
        yValue = (params - yValue) % params;
    }
    if (prefix === "03" && yValue % BigInt(2) === BigInt(0)) {
        yValue = (params - yValue) % params;
    }

    console.log(yValue);

    const xHex = xValue.toString(16).padStart(64, "0");
    const yHex = yValue.toString(16).padStart(64, "0");
    const decompressed = `04${xHex}${yHex}`

    return decompressed;
}

function modularExpo(x: bigint, y: bigint, p: bigint): bigint {
    let result = BigInt(1)

    while ( y > BigInt(0) ) {
        if ( y % BigInt(2) === BigInt(1) ){
            result = ( result * x ) % p;
        }

        x = ( x * x ) % p;
        y = y / BigInt(2);
    }

    return result;
}
