"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/protocols/constants.ts
var constants_exports = {};
__export(constants_exports, {
  PROTOCOL: () => PROTOCOL
});
module.exports = __toCommonJS(constants_exports);
var PROTOCOL = {
  ETHEREUM: "ethereum",
  NEAR_PROTOCOL: "near-protocol",
  AVALANCHE: "avalanche",
  COSMOS_HUB: "cosmos-hub",
  POLYGON: "polygon",
  SUI: "sui",
  TEZOS: "tezos",
  SOLANA: "solana",
  MULTIVERSX: "multiversx",
  POLKADOT: "polkadot"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PROTOCOL
});
//# sourceMappingURL=constants.cjs.map