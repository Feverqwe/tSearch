import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {chromium, type BrowserContext, type Worker} from '@playwright/test';
import {extensionDir} from '../../builder/paths.ts';
import manifest from '../../src/manifest.json' with {type: 'json'};

export const profileDir = path.resolve(extensionDir, '../../.tsearch-test-profile');

export async function launchLiveBrowser(headless: boolean) {
  await mkdir(profileDir, {recursive: true, mode: 0o700});
  return chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless,
    locale: 'en-US',
    ignoreDefaultArgs: ['--disable-extensions'],
  });
}

export async function liveExtensionHome(context: BrowserContext) {
  const isTSearch = async (worker: Worker) => {
    const url = new URL(worker.url());
    if (
      url.protocol !== 'chrome-extension:' ||
      url.pathname !== `/${manifest.background.service_worker}`
    ) {
      return false;
    }
    return worker
      .evaluate(
        (keyword) => chrome.runtime.getManifest().omnibox?.keyword === keyword,
        manifest.omnibox.keyword,
      )
      .catch(() => false);
  };
  const worker = await new Promise<Worker>((resolve, reject) => {
    const timer = setTimeout(() => {
      context.off('serviceworker', check);
      reject(new Error('Load dist/extension in the test Chrome profile via chrome://extensions'));
    }, 15_000);
    const check = async (worker: Worker) => {
      if (!(await isTSearch(worker))) return;
      clearTimeout(timer);
      context.off('serviceworker', check);
      resolve(worker);
    };
    context.on('serviceworker', check);
    for (const worker of context.serviceWorkers()) void check(worker);
  });
  return `chrome-extension://${new URL(worker.url()).host}/index.html`;
}
