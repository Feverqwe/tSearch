import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';
import type {Linter} from 'eslint';

const config: Linter.Config[] = [
  {ignores: ['dist/', 'storybook-static/', 'experiments/', '.codex/', '.tsearch-test-profile/']},
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {parserOpts: {plugins: ['typescript']}},
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-unused-vars': 'off',
      'no-cond-assign': 'off',
      'no-useless-assignment': 'off',
      'no-useless-escape': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parserOptions: {babelOptions: {parserOpts: {plugins: ['typescript', 'jsx']}}},
    },
  },
];

export default config;
