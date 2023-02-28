import type { Signer } from "../signer.js";

export interface SignerProvider<S = Signer<unknown, unknown>> {
    getSigner(identifier: string): Promise<S>;
}
