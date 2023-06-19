import { ed25519PrivateKey, KeyType, secp256k1PrivateKey } from "../../signer/index.js";
import { networks, SuiProtocol, SuiSigner } from "./index.js";

import { describe, expect, jest, test, xtest } from "@jest/globals";
import { hexToBytes } from "@noble/curves/abstract/utils";

jest.useFakeTimers()
    .setSystemTime(new Date(1684806992635));

const rpcMethods = {
    "suix_getReferenceGasPrice": async (_args: unknown) => "892",
    "suix_getCoins": async (_args: unknown[]) => ({
        "data": [
            {
                "coinType": "0x2::sui::SUI",
                "coinObjectId": "0x00754c0d72a0df78d3a8b832a1338887d16a89706c560153a8a37eb84714051d",
                "version": "3190351",
                "digest": "7xJnNKodLHFhk8FpKbAeRXHUsz9gwSqifmsaRNJnkA9G",
                "balance": "13816772905",
                "previousTransaction": "HGPYrBcgSgYd4BhyMXhBuj1MNym4inQ9vd8p6kCTckCU",
            },
        ],
        "nextCursor": "0x00754c0d72a0df78d3a8b832a1338887d16a89706c560153a8a37eb84714051d",
        "hasNextPage": false,
    }),
    "sui_dryRunTransactionBlock": async (_args: unknown[]) => ({
        "effects": {
            "messageVersion": "v1",
            "status": { "status": "success" },
            "executedEpoch": "40",
            "gasUsed": { "computationCost": "892000", "storageCost": "1976000", "storageRebate": "0", "nonRefundableStorageFee": "0" },
            "modifiedAtVersions": [{
                "objectId": "0x9d93c9576e4c0f4f8f2186d8b0499285d1c771c8786f1f9088f2ebc4d50087b1",
                "sequenceNumber": "1",
            }],
            "transactionDigest": "5MhDbbo9whLQHsWvGEJrjNWbnnSLBhS98hxf3jtdQME2",
            "created": [{
                "owner": { "AddressOwner": "0xb5d15ff56b01f7d99f95834c9d40083cb5580291dac442731ee254626ba41ba5" },
                "reference": {
                    "objectId": "0xf2d5d1993e4509b353aa706ba7bea9ce1a0c4e550aee51d4669e504b09c089da",
                    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
                    "version": 9223372036854775807,
                    "digest": "EpNCzKzLfm3eXA8EdZddrUuKNxPsd4CJFiaMPikQjWz5",
                },
            }],
            "mutated": [{
                "owner": { "AddressOwner": "0xcd63009fb37131e790684e982ec23ccba2e51aba96fa0ca4a0a018aafff1f3a8" },
                "reference": {
                    "objectId": "0x9d93c9576e4c0f4f8f2186d8b0499285d1c771c8786f1f9088f2ebc4d50087b1",
                    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
                    "version": 9223372036854775807,
                    "digest": "CXibyibFYRoFPFCzcZ2ojaZ9U2WrUCuzdFKaoFC91LQd",
                },
            }],
            "gasObject": {
                "owner": { "AddressOwner": "0xcd63009fb37131e790684e982ec23ccba2e51aba96fa0ca4a0a018aafff1f3a8" },
                "reference": {
                    "objectId": "0x9d93c9576e4c0f4f8f2186d8b0499285d1c771c8786f1f9088f2ebc4d50087b1",
                    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
                    "version": 9223372036854775807,
                    "digest": "CXibyibFYRoFPFCzcZ2ojaZ9U2WrUCuzdFKaoFC91LQd",
                },
            },
        },
        "events": [],
        "objectChanges": [{
            "type": "mutated",
            "sender": "0xcd63009fb37131e790684e982ec23ccba2e51aba96fa0ca4a0a018aafff1f3a8",
            "owner": { "AddressOwner": "0xcd63009fb37131e790684e982ec23ccba2e51aba96fa0ca4a0a018aafff1f3a8" },
            "objectType": "0x2::coin::Coin<0x2::sui::SUI>",
            "objectId": "0x9d93c9576e4c0f4f8f2186d8b0499285d1c771c8786f1f9088f2ebc4d50087b1",
            "version": "9223372036854775807",
            "previousVersion": "1",
            "digest": "CXibyibFYRoFPFCzcZ2ojaZ9U2WrUCuzdFKaoFC91LQd",
        }, {
            "type": "created",
            "sender": "0xcd63009fb37131e790684e982ec23ccba2e51aba96fa0ca4a0a018aafff1f3a8",
            "owner": { "AddressOwner": "0xb5d15ff56b01f7d99f95834c9d40083cb5580291dac442731ee254626ba41ba5" },
            "objectType": "0x2::coin::Coin<0x2::sui::SUI>",
            "objectId": "0xf2d5d1993e4509b353aa706ba7bea9ce1a0c4e550aee51d4669e504b09c089da",
            "version": "9223372036854775807",
            "digest": "EpNCzKzLfm3eXA8EdZddrUuKNxPsd4CJFiaMPikQjWz5",
        }],
        "balanceChanges": [{
            "owner": { "AddressOwner": "0xb5d15ff56b01f7d99f95834c9d40083cb5580291dac442731ee254626ba41ba5" },
            "coinType": "0x2::sui::SUI",
            "amount": "1000",
        }],
        "input": {
            "messageVersion": "v1",
            "transaction": {
                "kind": "ProgrammableTransaction",
                "inputs": [{ "type": "pure", "valueType": "u64", "value": "1000" }, {
                    "type": "pure",
                    "valueType": "address",
                    "value": "0xb5d15ff56b01f7d99f95834c9d40083cb5580291dac442731ee254626ba41ba5",
                }],
                "transactions": [{ "SplitCoins": ["GasCoin", [{ "Input": 0 }]] }, {
                    "TransferObjects": [[{ "NestedResult": [0, 0] }], { "Input": 1 }],
                }],
            },
            "sender": "0xcd63009fb37131e790684e982ec23ccba2e51aba96fa0ca4a0a018aafff1f3a8",
            "gasData": {
                "payment": [],
                "owner": "0xcd63009fb37131e790684e982ec23ccba2e51aba96fa0ca4a0a018aafff1f3a8",
                "price": "892",
                "budget": "50000000000",
            },
        },
    }),
};

globalThis.fetch = jest.fn(
    async (
        input: RequestInfo | URL,
        init?: RequestInit | undefined,
    ): Promise<Response> => {
        const body = init?.body;
        if (body) {
            const request = JSON.parse(body as string);
            const id = request["id"];
            const method = request["method"];

            if (typeof method === "string" && method in rpcMethods) {
                const result = await rpcMethods[method as keyof typeof rpcMethods](request["params"]);

                return new Response(
                    JSON.stringify({ jsonrpc: "2.0", id, result }),
                    {
                        status: 200,
                    },
                );
            }
        }

        console.log(input, init);

        return Promise.reject("No internet");
    },
);

const privateKeys = [
    {
        privateKey: "bad6dd621c36144d87916f9f86d3426894f41dc324c1535991629fe8400ebce3",
        keyType: "ed25519",
        expectedAddress: "0xcd63009fb37131e790684e982ec23ccba2e51aba96fa0ca4a0a018aafff1f3a8",
    },
    {
        privateKey: "96997c8a4b398b83398cdc36574aab755f39b34af1fd886ae717d6b9136cc4b1",
        keyType: "ed25519",
        expectedAddress: "0xb5d15ff56b01f7d99f95834c9d40083cb5580291dac442731ee254626ba41ba5",
    },
    {
        privateKey: "bf6a33877549a76bb3c93faeb11b272ff1de96a99be82f7bc0c6afa3c8ff4ed2",
        keyType: "ed25519",
        expectedAddress: "0x2bc9ec0b73ed5820c1fcb92a075e7f04b840038b3d94c1f09a87aa407d009bff",
    },
    {
        privateKey: "08692998848bb53213360573e49f28b62ae6588f0519f62e5c31ec8b6aa8fc26",
        keyType: "secp256k1",
        expectedAddress: "0xe030d9f745cb92cddd54eb4c75f42d8d29d61dc9048750ae1177f2a7f2a4b887",
    },
];

function constructSigner(keyType: KeyType, privateKey: Uint8Array): SuiSigner {
    const edSigner = keyType == "ed25519" ? new ed25519PrivateKey(privateKey) : new secp256k1PrivateKey(privateKey);
    const suiSigner = new SuiSigner(edSigner, networks["mainnet"]);

    return suiSigner;
}

describe("Sui signer", () => {
    test.each(privateKeys)("derives type $keyType address '$expectedAddress' correctly", ({ keyType, privateKey, expectedAddress }) => {
        const privateKeyBytes = hexToBytes(privateKey);
        const signer = constructSigner(keyType, privateKeyBytes);

        const addr = signer.keyPair.getPublicKey().toSuiAddress();
        expect(addr).toBe(expectedAddress);
    });

    xtest("signs transaction properly", async () => {
        const senderKey = privateKeys[0];
        const recipientKey = privateKeys[1];

        const privateKeyBytes = hexToBytes(senderKey.privateKey);
        const signer = constructSigner(senderKey.keyType, privateKeyBytes);

        const transferTx = await SuiProtocol.INSTANCE.createTransferTransaction(
            signer,
            recipientKey.expectedAddress,
            1000n,
        );
        const signature = await signer.signTransaction(transferTx);

        const expectedPayload =
            // eslint-disable-next-line max-len
            "AAACAAjoAwAAAAAAAAAgtdFf9WsB99mflYNMnUAIPLVYApHaxEJzHuJUYmukG6UCAgABAQAAAQEDAAAAAAEBAM1jAJ+zcTHnkGhOmC7CPMui5Rq6lvoMpKCgGKr/8fOoAQB1TA1yoN9406i4MqEziIfRaolwbFYBU6ijfrhHFAUdT64wAAAAAAAgZ1EsJhQBCI5wCnNuztn8/npvgF+3UPHtHcPGPr6zHIvNYwCfs3Ex55BoTpguwjzLouUaupb6DKSgoBiq//HzqHwDAAAAAAAAgF85AAAAAAAA";
        const expectedSignature =
            // eslint-disable-next-line max-len
            "ABRIzGKArDDLlAHJ5AyP3G+Hx/maMmVtOPNsGq9cPjJaqvgHuA+vJiO4hROAkUg3cJxAq0bDPVEJtslZMLBEWgIfE0FhO3zHJLsGntISZx1LMomMiBCDGkZ+sFSKtGyY7Q==";

        expect(signature.payload.transactionBlockBytes).toBe(expectedPayload);
        expect(signature.payload.signature).toBe(expectedSignature);
    });
});
