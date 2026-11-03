// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const boundaries = require('eslint-plugin-boundaries');
const tseslint = require('typescript-eslint');
const unusedImports = require('eslint-plugin-unused-imports');

const HEX_COLOR = '^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$';

module.exports = defineConfig([
  expoConfig,

  // Type-aware strict rules (TypeScript files only)
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      // Numbers in template strings are fine (`Item ${n}`); other non-strings are not
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // `onPress={() => router.push(...)}` is idiomatic in React Native
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    },
  },

  prettierConfig,

  // Style and hygiene
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      // if/else always use braces; ternaries stay single-level
      curly: ['error', 'all'],
      'no-nested-ternary': 'error',

      // Deprecated or superseded imports: the message names the approved alternative
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['SafeAreaView'],
              message:
                "Deprecated. Import SafeAreaView from 'react-native-safe-area-context' instead.",
            },
            { name: 'moment', message: "Use 'date-fns' instead." },
            { name: 'moment-timezone', message: "Use 'date-fns' instead." },
          ],
        },
      ],

      // Colours come from constants/theme.ts, not raw hex literals
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=/${HEX_COLOR}/]`,
          message: 'No raw hex colours. Use a token from constants/theme.ts.',
        },
      ],
    },
  },

  // Architecture: who may import whom
  {
    files: ['app/**', 'components/**', 'hooks/**', 'api/**', 'lib/**', 'types/**', 'constants/**'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
      'boundaries/elements': [
        { type: 'app', pattern: 'app' },
        { type: 'components', pattern: 'components' },
        { type: 'hooks', pattern: 'hooks' },
        { type: 'api', pattern: 'api' },
        { type: 'lib', pattern: 'lib' },
        { type: 'types', pattern: 'types' },
        { type: 'constants', pattern: 'constants' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            // Screens compose UI and hooks; they never call the API directly
            {
              from: { element: { type: 'app' } },
              allow: {
                to: { element: { types: ['components', 'hooks', 'lib', 'types', 'constants'] } },
              },
            },
            // UI primitives know nothing about screens or the API
            {
              from: { element: { type: 'components' } },
              allow: {
                to: { element: { types: ['components', 'hooks', 'lib', 'types', 'constants'] } },
              },
            },
            {
              from: { element: { type: 'hooks' } },
              allow: { to: { element: { types: ['hooks', 'api', 'lib', 'types', 'constants'] } } },
            },
            {
              from: { element: { type: 'api' } },
              allow: { to: { element: { types: ['api', 'types', 'constants'] } } },
            },
            {
              from: { element: { type: 'lib' } },
              allow: { to: { element: { types: ['lib', 'types', 'constants'] } } },
            },
            {
              from: { element: { type: 'constants' } },
              allow: { to: { element: { types: ['constants', 'types'] } } },
            },
            {
              from: { element: { type: 'types' } },
              allow: { to: { element: { type: 'types' } } },
            },
          ],
        },
      ],
    },
  },

  // Tokens live here, so hex colours are allowed
  {
    files: ['constants/theme.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },

  // Tests and tooling: Jest globals, no type-aware strictness for plain JS
  {
    files: ['__tests__/**', 'jest.setup.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { __dirname: 'readonly', require: 'readonly', module: 'writable' },
    },
  },

  // mocks/ is the provided challenge fixtures, not our code
  { ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*', 'mocks/*'] },
]);
