module.exports = {
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: true,
    env: {
        es2022: true,
        node: true
    },
    rules: {
        "max-len": [1, 140],
        "@typescript-eslint/no-explicit-any": 2,
        "@typescript-eslint/no-unused-vars": 2,
        "@typescript-eslint/quotes": [2, "double"],
        "@typescript-eslint/semi": [2, "always"],
        "@typescript-eslint/indent": [2, 4],
        "@typescript-eslint/object-curly-spacing": [2, "always"]
    }
};
