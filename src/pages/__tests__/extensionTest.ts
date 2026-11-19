import {test as base, chromium, type BrowserContext, type Worker} from '@playwright/test';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {extensionDir} from '../../../builder/paths.ts';

export const test = base.extend<{
  extension: {context: BrowserContext; worker: Worker; app: string};
}>({
  extension: async ({viewport}, use) => {
    const profile = await mkdtemp(path.join(tmpdir(), 'tsearch-tracker-test-'));
    let context: BrowserContext | undefined;
    try {
      context = await chromium.launchPersistentContext(profile, {
        channel: 'chromium',
        locale: 'en-US',
        viewport,
        args: [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`],
      });
      await context.route(/^https?:/, (route) => route.abort());
      await context.route('https://suggestqueries.google.com/**', (route) =>
        route.fulfill({json: ['', []]}),
      );
      const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      const app = await worker.evaluate(async () => {
        await chrome.storage.local.set({lastCheckUpdateAt: Math.floor(Date.now() / 1000)});
        return chrome.runtime.getURL('index.html');
      });
      await use({context, worker, app});
    } finally {
      await context?.close();
      await rm(profile, {recursive: true, force: true});
    }
  },
});
