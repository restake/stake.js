import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        "src/**/*.ts",
        "!src/**/*.test.ts",
    ],
    format: [
        "cjs",
        "esm",
    ],
    target: "node18",
    sourcemap: true,
    clean: true,
    splitting: false,
    dts: true,
});
