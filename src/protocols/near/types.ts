import { NEAR_PROTOCOL_NETWORKS } from "./constants.ts";

export type NearProtocolNetwork = typeof NEAR_PROTOCOL_NETWORKS[keyof typeof NEAR_PROTOCOL_NETWORKS];

export {
    Transaction as NearProtocolRawTransaction,
    SignedTransaction as NearProtocolSignedTransaction,
} from "near-api-js/lib/transaction.js";
