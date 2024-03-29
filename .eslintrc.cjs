module.exports = {
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: true,
    env: {
        es2022: true,
        node: true,
    },
    rules: {
        "indent": ["error", 4, {
            "MemberExpression": 1,
        }],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "object-curly-spacing": ["error", "always"],
        "max-len": ["warn", 140],
        "comma-dangle": ["error", "always-multiline"],
        "arrow-parens": ["error", "always"],
        "newline-before-return": "error",
        "space-before-function-paren": ["error", {
            "anonymous": "always",
            "asyncArrow": "always",
            "named": "never",
        }],
        "capitalized-comments": ["error", "always", {
            "line": {
                "ignorePattern": "pragma|ignored",
            },
            "block": {
                "ignoreInlineComments": true,
                "ignorePattern": "ignored",
            },
        }],
        "@typescript-eslint/no-unused-vars": ["error", {
            "argsIgnorePattern": "^_",
        }],
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-inferrable-types": "off",
    },
};
