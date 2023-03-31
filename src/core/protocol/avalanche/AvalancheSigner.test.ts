import { secp256k1PrivateKey, secp256k1Signer } from "../../signer/index.js";
import { AvalancheProtocol, AvalancheSigner, networks } from "./index.js";

import { describe, expect, jest, test } from "@jest/globals";
import { BinTools } from "avalanche";

jest
  .useFakeTimers()
  .setSystemTime(new Date(4835932882000));

const rpcMethods = {
    "platform.getUTXOs": async (args: { addresses: string[] }) => {
        const firstAddress = args.addresses[0];
        return {
            "numFetched": "17",
            "utxos": [
                "0x00004251430be886e6b02fb08c126f7f9e7cf027a0979619f4380ffd640714455012000000013d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa000000070000000059682f0000000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc32c962f9f",
                "0x00004251430be886e6b02fb08c126f7f9e7cf027a0979619f4380ffd640714455012000000023d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000000079254300000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3a0c084da",
                "0x00000d4a6d890df54c3f9609a75fcd34b91d6b248df90eca34cd496917982e7d83d4000000023d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000000050c29200000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3bf2b330b",
                "0x00000d4a6d890df54c3f9609a75fcd34b91d6b248df90eca34cd496917982e7d83d4000000013d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000003b9aca0000000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3d4abdd2f",
                "0x00005900422c670e5546f941421cdbd5acccf369a8a1f41f18fb9ef70db503d001b8000000013d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000003b9aca0000000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc34369fac1",
                "0x00005900422c670e5546f941421cdbd5acccf369a8a1f41f18fb9ef70db503d001b8000000023d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa0000000700000000000f3cb100000000000000020000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3975661e3",
                "0x00004251430be886e6b02fb08c126f7f9e7cf027a0979619f4380ffd640714455012000000003d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000001dcd650000000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3f9b9833c",
                "0x000016a5a775de53dc11f3cc0f48829f9b738a35f247e73607879a2de48e098252fd000000023d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000000016e17000000000000000020000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3f5a8096c",
                "0x0000163f0fc772d419935d83017abd698a8a12dd7e97ad08738490207d18f4080731000000013d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000000016e17000000000000000020000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3fd0b8011",
                "0x00001485d6af07c44a37bf449b0bdae47e8eaab619a7537a83571195c72b34879e02000000013d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000003b9aca0000000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3ab5975ec",
                "0x00001485d6af07c44a37bf449b0bdae47e8eaab619a7537a83571195c72b34879e02000000023d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000000016e17000000000000000020000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc30cc15a4e",
                "0x00005900422c670e5546f941421cdbd5acccf369a8a1f41f18fb9ef70db503d001b8000000003d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa0000000700000000000dae2100000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3158541fa",
                "0x00003d0ae4ebb44666098bfb5db612cdeb9c76629ca2cfc48df72bf769ae55f505e6000000003d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000002f2058e700000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc308f7a6b0",
                "0x0000567fce5b5abcb9c6640e86124ef02b0118b781afdf732daa3bc77c3cd5279be9000000003d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000000848f8c000000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3974bc706",
                "0x0000b1dd0071e8deb6f1fdf088982c93e357b99b322be4853b07c43b58abc5b3490d000000023d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa000000070000000002ebae4000000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc39ef254e4",
                "0x0000b1dd0071e8deb6f1fdf088982c93e357b99b322be4853b07c43b58abc5b3490d000000013d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000000000c35000000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3cb281434",
                "0x0000b1dd0071e8deb6f1fdf088982c93e357b99b322be4853b07c43b58abc5b3490d000000003d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000000000c35000000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc388e3bc90",
            ],
            "endIndex": {
                "address": firstAddress,
                "utxo": "g9GGo5VM93phDTi7CDPN17AHYPJQFi1CTFjn34VHYduvKLXez",
            },
            "encoding":"hex"
        };
    },
    "platform.getStakingAssetID": async (args: unknown) => ({ assetID: "U8iRqJoiJm8xZHAacmvYyZVwqQx6uDNtQeP3CQ6fcgQk3JqnK" }),
    "platform.getMinStake": async (args: unknown) => ({minValidatorStake: "1000000000", minDelegatorStake: "1000000000"}),
};

globalThis.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
    let body: unknown;
    if (input instanceof Request) {
        body = await input.json();
    } else if (init?.body) {
        body = JSON.parse(init.body as string);
    } else {
        body = undefined;
    }

    if (body) {
        const request = body as any;
        const id = request["id"];
        const method = request["method"];

        if (typeof method === "string" && method in rpcMethods) {
            const result = await rpcMethods[method as keyof typeof rpcMethods](request["params"]);

            return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
                headers: {
                    "content-type": "application/json",
                },
                status: 200,
            });
        }
    }

    console.log(input, init);
    return Promise.reject("No internet");
});

const privateKeys = [
    {
        privateKey: "PrivateKey-ntFeL5b3raNyEZ2VJro7oEj2WHAvkkoG4xRPABmdKV8mW8yGL",
        expectedAddress: "P-fuji15t0akjk9mr8qspg2295a6uxq63ycmnxryycjdz",
    },
    {
        privateKey: "PrivateKey-HsMbk4ftVUqNbQ53cEdGTcou2tCMAYjHq6aNAGgPtEH9yWQvC",
        expectedAddress: "P-fuji184jcgj3y4t0c8ja0e246ghkcqc26wp3pns4gkf",
    },
    {
        privateKey: "PrivateKey-2ZAcDtD2Mft3a9qaF9DVs9Bet4sH1TAKyRpUMXim3CG1X2QEpQ",
        expectedAddress: "P-fuji1ux4zq7w9ylyq96cp27gk3dkpvzffr8xazm3x59",
    },
    {
        privateKey: "PrivateKey-2HUAvWtsb7LdbapXZcwwxdReyTZ4ruwyjjdASQ3czWs8UDsPZX",
        expectedAddress: "P-fuji13qfrmjhr69jdnnyxvlywx20yj8n2v5u9etu5l0",
    },
];

describe("Avalanche signer", () => {
    test.each(privateKeys)("signer construction", async ({ privateKey, expectedAddress }) => {
        const privateKeyBytes = BinTools.getInstance().cb58Decode(privateKey.replace("PrivateKey-", ""));

        const edSigner = new secp256k1Signer(new secp256k1PrivateKey(privateKeyBytes));
        const signer = new AvalancheSigner(edSigner, networks["testnet"]);

        const derivedAddress = signer.deriveAddress("P");
        expect(derivedAddress).toBe(expectedAddress);
    });

    test("signs transaction properly", async () => {
        const privateKey = privateKeys[0].privateKey;
        const privateKeyBytes = BinTools.getInstance().cb58Decode(privateKey.replace("PrivateKey-", ""));

        const edSigner = new secp256k1Signer(new secp256k1PrivateKey(privateKeyBytes));
        const signer = new AvalancheSigner(edSigner, networks["testnet"]);

        // Wed Mar 31 2123 10:41:22 GMT+0000
        const base = 4835932882000;

        const dateStart = new Date(base+10000)
        const dateEnd = new Date(base+1209600000);

        const tx = await AvalancheProtocol.INSTANCE.buildStakeTransaction(
            signer,
            "NodeID-3VWnZNViBP2b56QBY7pNJSLzN2rkTyqnK",
            "1000000001",
            dateStart,
            dateEnd,
        );
        const signedTx = await signer.signTransaction(tx);

        const expected = "0x00000000000e000000050000000000000000000000000000000000000000000000000000000000000000000000013d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000001dcd64ff00000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3000000014251430be886e6b02fb08c126f7f9e7cf027a0979619f4380ffd640714455012000000013d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa000000050000000059682f000000000100000000000000001b54c31d7418654d118dba821af73306e351e80400000001203e7adc000000012050efd2000000003b9aca01000000013d9bdac0ed1d761330cf680efdeb1a42159eb387d6d2950c96f7d28f61bbe2aa00000007000000003b9aca0100000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc30000000b00000000000000000000000100000001a2dfdb4ac5d8ce08050a5169dd70c0d4498dccc3000000010000000900000001751ac12355a59fbad05418d2d767ef868796a031a04189c5423812169390473d398ab18bb3e6da8c43d708b72378ae7c3a864acd7dad862939cffeb346a3099a013c82c47c";
        const serialized = signedTx.payload.toStringHex();

        expect(serialized).toBe(expected);
    });
});
