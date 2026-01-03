const prettierConfig = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');

const baseConfig = require('./base');

module.exports = {
  ...baseConfig,
  languageOptions: {
    ...baseConfig.languageOptions,
    parserOptions: {
      ...baseConfig.languageOptions.parserOptions,
      project: './tsconfig.base.json',
    },
  },
  plugins: {
    ...baseConfig.plugins,
    import: importPlugin,
    prettier: prettierPlugin,
  },
  rules: {
    ...baseConfig.rules,
    'prettier/prettier': 'error',

    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
      },
      {
        selector: 'class',
        format: ['PascalCase'],
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['sibling', 'parent'],
          'index',
          'object',
          'type',
        ],
        pathGroups: [
          {
            pattern: '@nx-microservices/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@nestjs/**',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-named-as-default': 'warn',
    'import/newline-after-import': 'error',
    'import/no-cycle': ['error', { maxDepth: 3 }],
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': ['error', { noUselessIndex: true }],

    'no-useless-constructor': 'off',

    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../**/node_modules'],
            message: 'Direct node_modules imports are not allowed',
          },
        ],
      },
    ],

    'brace-style': 'off',
    'comma-dangle': 'off',
    quotes: 'off',
    semi: 'off',
    indent: 'off',
    'max-len': 'off',
    'object-curly-spacing': 'off',
    'arrow-parens': 'off',
    'no-trailing-spaces': 'off',
    'no-multiple-empty-lines': 'off',
    'eol-last': 'off',

    ...prettierConfig.rules,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.base.json',
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
