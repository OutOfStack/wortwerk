import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "dist/**",
    ".wrangler/**",
    ".sites-runtime/**",
    "next-env.d.ts",
  ]),
  {
    files: ["app/sign-in/page.tsx", "public/app.js"],
    rules: {
      // Account transitions need a full load to reset the imperative practice
      // app and its account-specific in-memory progress.
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-location-assign-relative-destination": "off",
    },
  },
]);

export default eslintConfig;
