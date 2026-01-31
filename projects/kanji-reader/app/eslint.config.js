const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

const compat = new FlatCompat({
  baseDirectory: require('path').dirname(require.resolve('./package.json')),
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: ['node_modules/', 'dist/', '.expo/'],
  },
  ...compat.extends('expo'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
