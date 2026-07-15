const js = require("@eslint/js");
const globals = require("globals");
const { defineConfig } = require("eslint/config");

// Node/Express backend — CommonJS (require/module.exports), not browser code.
module.exports = defineConfig([
  {
    files: ["**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
  },
]);
