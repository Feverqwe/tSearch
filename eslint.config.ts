import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';
import type {Linter} from 'eslint';
import importX from 'eslint-plugin-import-x';

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
    plugins: {'import-x': importX},
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-unused-vars': 'off',
      'no-cond-assign': 'off',
      'no-useless-assignment': 'off',
      'no-useless-escape': 'off',
      'sort-imports': ['error', {ignoreDeclarationSort: true}],
      'import-x/order': [
        'error',
        {
          alphabetize: {order: 'asc'},
          'newlines-between': 'always',
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            {pattern: 'react', group: 'external', position: 'before'},
            {
              pattern: '*.{svg,png,jpg,jpeg,webp,json}',
              patternOptions: {dot: true, nocomment: true, matchBase: true},
              group: 'type',
              position: 'after',
            },
            {
              pattern: '*.{css,sass,scss,less,styl}',
              patternOptions: {dot: true, nocomment: true, matchBase: true},
              group: 'type',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          warnOnUnassignedImports: true,
        },
      ],
    },
  },
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parserOptions: {babelOptions: {parserOpts: {plugins: ['typescript', 'jsx']}}},
    },
  },
  {
    // These imports register a background listener and establish the date-picker CSS cascade.
    files: ['src/background/index.ts', 'src/components/FiltersPanel.tsx'],
    rules: {'import-x/order': 'off'},
  },
];

export default config;
