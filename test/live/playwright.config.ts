import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: '.',
  outputDir: '../../dist/browser-live-results',
  workers: 1,
  timeout: 60_000,
  reporter: 'list',
});
