import {defineConfig} from '@playwright/test';

export default defineConfig({
  projects: [
    {name: 'extension', testDir: './test/browser'},
    {name: 'tracker-editor', testDir: './src/pages/__tests__'},
  ],
  outputDir: './dist/browser-results',
  fullyParallel: true,
  reporter: 'list',
});
