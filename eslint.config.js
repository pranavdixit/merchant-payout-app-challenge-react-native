// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      // if/else always use braces; ternaries stay single-level
      curly: ['error', 'all'],
      'no-nested-ternary': 'error',
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
