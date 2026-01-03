const nx = require('@nx/eslint-plugin');

const baseConfig = require('./libs/common/configs/eslint/base');
const nestConfig = require('./libs/common/configs/eslint/nest');

module.exports = [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.nx/**'],
  },
  {
    ...baseConfig,
    plugins: {
      ...baseConfig.plugins,
      '@nx': nx,
    },
  },
  {
    files: ['apps/**/*.ts', 'apps/**/*.tsx', 'libs/rabbitmq/**/*.ts', 'libs/redis/**/*.ts'],
    ...nestConfig,
    plugins: {
      ...nestConfig.plugins,
      '@nx': nx,
    },
  },
];
