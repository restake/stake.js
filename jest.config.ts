import type { JestConfigWithTsJest } from "ts-jest";

export default <JestConfigWithTsJest> {
    preset: "ts-jest/presets/default-esm",
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};
