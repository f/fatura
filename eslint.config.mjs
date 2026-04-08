import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["dist/**", "node_modules/**", "website/**", "coverage/**"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.ts", "declarations/**/*.ts"],
        languageOptions: {
            globals: { ...globals.node },
        },
    },
    {
        files: ["vitest.config.ts", "vitest.config.integration.ts"],
        languageOptions: {
            globals: { ...globals.node },
        },
    },
    {
        files: ["tests/**/*.ts"],
        languageOptions: {
            globals: { ...globals.node, ...globals.vitest },
        },
    },
    eslintConfigPrettier,
);
