import type { JestConfigWithTsJest } from "ts-jest";

process.env["TS_JEST_DISABLE_VER_CHECKER"] = "true";

export default <JestConfigWithTsJest> {
    preset: "ts-jest/presets/default-esm",
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};
