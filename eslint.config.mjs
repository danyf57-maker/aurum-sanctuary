import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: [
            ".next/**",
            "functions/lib/**",
            "node_modules/**",
            "_bmad/**",
            "email-templates/**",
            "public/**",
            "screenshots/**",
        ],
    },
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
    },
    ...compat.extends("next/core-web-vitals"),
    {
        rules: {
            "react/no-unescaped-entities": "off",
            "react-hooks/exhaustive-deps": "off",
            "@next/next/no-img-element": "off",
        },
    },
];

export default eslintConfig;
