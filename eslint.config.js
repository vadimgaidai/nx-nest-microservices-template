const nx = require('@nx/eslint-plugin');
const baseConfig = require('./libs/common/configs/eslint/base');

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
];
