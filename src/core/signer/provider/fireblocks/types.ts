import { z } from "zod";

export const Address = z.object({
    assetId: z.string(),
    address: z.string(),
    description: z.string(),
    tag: z.string(),
    type: z.string(),
    customerRefId: z.optional(z.string()),
    addressFormat: z.optional(z.string()),
    legacyAddress: z.string(),
    enterpriseAddress: z.string(),
    bip44AddressIndex: z.optional(z.number()),
    userDefined: z.boolean(),
});

export type Address = z.infer<typeof Address>;

export const Asset = z.object({
    id: z.string(),
});

export type Asset = z.infer<typeof Asset>;

export const Account = z.object({
    id: z.string(),
    name: z.string(),
    assets: z.array(Asset),
});

export type Account = z.infer<typeof Account>;

export const PublicKeyInfo = z.object({
    algorithm: z.string(),
    derivationPath: z.array(z.number()),
    // Encoded as hex
    publicKey: z.string(),
});

export type PublicKeyInfo = z.infer<typeof PublicKeyInfo>;

export const Transaction = z.object({
    id: z.string(),
    status: z.enum([
        "BLOCKED",
        "BROADCASTING",
        "CANCELLED",
        "COMPLETED",
        "CONFIRMING",
        "FAILED",
        "PARTIALLY_COMPLETED",
        "PENDING_3RD_PARTY",
        "PENDING_3RD_PARTY_MANUAL_APPROVAL",
        "PENDING_AML_SCREENING",
        "PENDING_AUTHORIZATION",
        "PENDING_SIGNATURE",
        "QUEUED",
        "REJECTED",
        "SUBMITTED",
    ]),
    subStatus: z.string(),
    signedMessages: z.array(z.object({
        algorithm: z.string(),
        publicKey: z.string(),
        signature: z.object({
            fullSig: z.string(),
            r: z.optional(z.string()),
            s: z.optional(z.string()),
            v: z.optional(z.string()),
        }),
    })),
});

export type Transaction = z.infer<typeof Transaction>;
