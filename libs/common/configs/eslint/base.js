const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = {
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    globals: {
      node: true,
      es2022: true,
    },
  },
  plugins: {
    '@typescript-eslint': tseslint,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'no-duplicate-imports': 'off',
    'no-empty-function': ['error', { allow: ['constructors'] }],
    'no-unused-expressions': 'error',
    'no-return-await': 'off',
    '@typescript-eslint/return-await': ['error', 'in-try-catch'],

    eqeqeq: ['error', 'always', { null: 'ignore' }],
    curly: ['error', 'all'],
  },
};
