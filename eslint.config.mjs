import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";

export default [
    // Apply to all files
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },

// Base ESLint recommended rules
js.configs.recommended,

// TypeScript-specific recommended rules
...tseslint.configs.recommended,

{
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                "varsIgnorePattern": "^_",
                "argsIgnorePattern": "^_",
            },
        ],
    },
}
];
