import BN from "bn.js";

export function BNFromBigInt(bigInt: BigInt): BN {
    return new BN(bigInt.toString());
}
