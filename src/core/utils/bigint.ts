import BN from "bn.js";

export function BNFromBigInt(bigInt: bigint): BN {
    return new BN(bigInt.toString());
}
