import {test as base, expect, chromium, type BrowserContext, type Worker} from '@playwright/test';
import {createServer} from 'node:http';
import {filesize} from 'filesize';
import JSZip from 'jszip';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {extensionDir} from '../../builder/paths.ts';
import {prepareTrackerDefinition} from '../../src/tools/trackerDefinition.ts';
import type {HistoryEntry} from '../../src/data/history';
import type {QuickResult} from '../../src/data/quickSearch';

const test = base.extend<{extension: {context: BrowserContext; worker: Worker; url: string}}>({
  extension: async ({viewport}, use, testInfo) => {
    const browserErrors: string[] = [];
    const profile = await mkdtemp(path.join(tmpdir(), 'tsearch-browser-'));
    let context: BrowserContext | undefined;
    try {
      context = await chromium.launchPersistentContext(profile, {
        channel: 'chromium',
        locale: 'en-US',
        timezoneId: 'UTC',
        viewport,
        args: [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`],
      });
      context.on('page', (page) => {
        page.on('pageerror', (error) => browserErrors.push(error.stack ?? error.message));
        page.on('console', (message) => {
          if (message.type() === 'error' || message.type() === 'warning')
            browserErrors.push(message.text());
        });
      });
      await context.route('https://suggestqueries.google.com/**', (route) =>
        route.fulfill({json: ['', []]}),
      );
      await context.route('https://images.example.test/explorer.png', (route) =>
        route.fulfill({
          contentType: 'image/svg+xml',
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
        }),
      );
      const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      const url = await worker.evaluate(() => chrome.runtime.getURL('').slice(0, -1));
      await use({context, worker, url});
    } finally {
      if (testInfo.status !== testInfo.expectedStatus && browserErrors.length) {
        console.error(browserErrors.join('\n'));
      }
      await context?.close();
      await rm(profile, {force: true, recursive: true});
    }
  },
});

test('route themes survive navigation and popup follows the saved appearance', async ({
  extension,
}) => {
  const {context, url} = extension;
  const page = await context.newPage();
  await page.emulateMedia({colorScheme: 'light'});
  await page.goto(`${url}/index.html#/options?theme=dark`);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-theme', 'dark');
  await expect(page).toHaveURL(/#\/options\/main\?theme=dark$/);
  const history = page.getByRole('link', {name: 'History', exact: true});
  await history.focus();
  await expect(history).toBeFocused();
  await expect(history).toHaveCSS('outline-style', 'solid');
  await history.press('Enter');
  await expect(page).toHaveURL(/#\/history\?theme=dark$/);
  await page.reload();
  await expect(root).toHaveAttribute('data-theme', 'dark');
  await page.goBack();
  await expect(page).toHaveURL(/#\/options\/main\?theme=dark$/);

  const popup = await context.newPage();
  await popup.emulateMedia({colorScheme: 'light'});
  await popup.goto(`${url}/popup.html`);
  await expect(popup.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByLabel('Appearance').selectOption('dark');
  await expect(popup.locator('html')).toHaveAttribute('data-theme', 'dark');
  const popupSearch = popup.getByRole('combobox', {name: 'Search'});
  await popupSearch.focus();
  await expect(popupSearch).toHaveCSS('outline-style', 'none');
  await popup.keyboard.press('Tab');
  await expect(popup.getByRole('button', {name: 'Search'})).toBeFocused();
  await expect(popup.getByRole('button', {name: 'Search'})).toHaveCSS('outline-style', 'solid');
  await page.getByLabel('Appearance').selectOption('system');
  await expect(root).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({colorScheme: 'dark'});
  await expect(root).toHaveAttribute('data-theme', 'dark');
});

test('the toolbar popup leaves enough room for the search field', async ({extension}) => {
  const {context, worker, url} = extension;
  const tab = await context.newPage();
  await tab.goto(`${url}/popup.html`);
  await worker.evaluate(() => chrome.action.openPopup());

  await expect
    .poll(() =>
      tab.evaluate(() => {
        const popup = chrome.extension.getViews({type: 'popup'})[0];
        const field = popup?.document.querySelector<HTMLInputElement>('input[type="search"]');
        const submit = field?.form?.querySelector('button[type="submit"]');
        if (!field || !submit) return false;
        const button = submit.getBoundingClientRect();
        return (
          field.getBoundingClientRect().width > button.width && button.right <= popup.innerWidth
        );
      }),
    )
    .toBe(true);
});

test('a legacy backup is inspected before it replaces either storage area', async ({extension}) => {
  const {context, worker, url} = extension;
  const page = await context.newPage();
  await page.goto(`${url}/index.html#/options/backup?theme=dark`);
  const importButton = page.getByRole('button', {name: /import.*zip/i});
  const readAreas = () =>
    worker.evaluate(async () => ({
      history: (await chrome.storage.local.get('history')).history,
      options: (await chrome.storage.sync.get('options')).options,
    }));
  const baseline = await readAreas();

  const zip = new JSZip();
  zip.file(
    'history.json',
    JSON.stringify({Sintel: {query: 'Sintel', time: 1794733200, count: 1, clicks: {}}}),
  );
  zip.file('sync/options.json', JSON.stringify({hidePeerRow: true}));
  zip.file('local/unused.json', '{}');
  const buffer = await zip.generateAsync({type: 'nodebuffer'});
  const choose = async (buffer: Buffer) => {
    const chooser = page.waitForEvent('filechooser');
    await importButton.click();
    await (await chooser).setFiles({name: 'backup.zip', mimeType: 'application/zip', buffer});
  };

  await choose(Buffer.from('broken zip'));
  await expect(page.getByRole('alert')).toContainText('Could not read this archive');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await readAreas()).toEqual(baseline);
  await choose(buffer);
  const dialog = page.getByRole('dialog', {name: 'Review backup'});
  await expect(dialog.getByRole('listitem')).toHaveText(['Search history', 'Extension settings']);
  expect(await readAreas()).toEqual(baseline);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(importButton).toBeFocused();
  await choose(buffer);
  await dialog.getByRole('button', {name: 'Restore data'}).click();
  await expect(page.getByText('Data restored.')).toBeVisible();
  await page.getByRole('link', {name: 'History', exact: true}).click();
  await expect(page.getByRole('link', {name: 'Sintel', exact: true})).toBeVisible();
  expect((await readAreas()).options).toMatchObject({hidePeerRow: true});
});

test('title display follows saved settings and history deletion keeps keyboard focus', async ({
  extension,
}) => {
  const {context, worker, url} = extension;
  const title = 'Sintel (2010) [Sintel 1080p]';
  const itemUrl = 'https://fixture.test/sintel';
  await worker.evaluate(
    async ({title, itemUrl}) => {
      await chrome.storage.local.set({
        history: {
          Sintel: {
            query: 'Sintel',
            time: 1794733200,
            count: 1,
            clicks: {
              [itemUrl]: {url: itemUrl, title, trackerId: 'fixture', time: 1794733210},
            },
          },
          'Big Buck Bunny': {query: 'Big Buck Bunny', time: 1794733190, count: 1, clicks: {}},
        },
      });
    },
    {title, itemUrl},
  );
  const page = await context.newPage();
  await page.setViewportSize({width: 420, height: 760});
  await page.goto(`${url}/index.html#/options/titles?theme=dark`);
  await expect(page.getByRole('heading', {name: 'Release titles'})).toBeVisible();
  await expect(page.getByText('Search query: “Sintel”')).toBeVisible();
  await page.getByRole('combobox', {name: 'Square brackets', exact: true}).selectOption('accent');
  await expect(page.locator('.title-preview .title-tone-accent')).toHaveText('[1080p · Blu-ray]');
  await page.getByRole('link', {name: 'History', exact: true}).click();
  const result = page.getByRole('link', {name: title, exact: true});
  await expect(result).toHaveAttribute('href', itemUrl);
  await expect(result.locator('.title-tone-accent').first()).toBeVisible();
  await page.reload();
  await expect(result.locator('.title-tone-accent').first()).toBeVisible();
  const remove = page.getByRole('button', {name: `Delete: ${title}`});
  await remove.focus();
  await expect(remove).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(result).toHaveCount(0);
  await expect(page.getByRole('link', {name: 'Big Buck Bunny', exact: true})).toBeFocused();
  await expect(page.getByRole('link', {name: 'Sintel', exact: true})).toBeVisible();

  const devtools = await context.newCDPSession(page);
  await devtools.send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1});
  await expect(page.getByRole('button', {name: 'Delete: Sintel', exact: true})).toHaveCSS(
    'opacity',
    '1',
  );
  await devtools.detach();
});

test('options persist and update the toolbar action', async ({extension}) => {
  const {context, worker, url} = extension;
  const actionPopup = () => worker.evaluate(() => chrome.action.getPopup({}));
  await expect.poll(actionPopup).toBe(`${url}/popup.html`);

  const page = await context.newPage();
  await page.goto(`${url}/index.html#/options`);
  const disablePopup = page.getByRole('checkbox', {name: /disable search popup/i});
  const otherPage = await context.newPage();
  await otherPage.goto(`${url}/index.html#/options`);
  const otherCheckbox = otherPage.getByRole('checkbox', {name: /disable search popup/i});
  await expect(otherCheckbox).not.toBeChecked();
  await disablePopup.check();
  await expect(otherCheckbox).toBeChecked();
  await expect.poll(actionPopup).toBe('');
  await page.reload();
  await expect(disablePopup).toBeChecked();
});

const nativeScreenTest = test.extend({viewport: null});

for (const mode of ['direct', 'tab', 'window'] as const) {
  nativeScreenTest(`searches a JSON tracker in ${mode} mode`, async ({extension}) => {
    const {context, worker, url} = extension;
    const enableProxy = mode !== 'direct';
    const finishFirstRequest = Promise.withResolvers<void>();
    const finishFailedPage = Promise.withResolvers<void>();
    let firstRequestReceived = false;
    let definition = '';
    let nextPageRequests = 0;
    const server = createServer(async (request, response) => {
      if (request.url === '/tracker.json') {
        response.setHeader('Content-Type', 'application/json');
        response.end(definition);
        return;
      }
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      if (request.url?.startsWith('/search')) {
        if (enableProxy && !request.headers.cookie?.includes('tracker-session=fixture')) {
          response.writeHead(401).end('Missing tracker cookie');
        } else if (request.url?.startsWith('/search-next')) {
          nextPageRequests++;
          if (nextPageRequests === 1) {
            if (mode === 'direct') await finishFailedPage.promise;
            response.writeHead(500).end('Temporary failure');
          } else {
            response.end(
              '<article><a href="/next-item">Next page result</a></article>' +
                '<a class="next" href="/search-last">Last page</a>',
            );
          }
        } else if (request.url?.startsWith('/search-last')) {
          response.end(
            '<article><a href="/last-item">Last page result</a></article>' +
              '<a class="next" href="/search-next">Already loaded page</a>',
          );
        } else {
          firstRequestReceived = true;
          if (enableProxy) await finishFirstRequest.promise;
          response.end(
            '<article><a href="/item">Big Buck Bunny test result</a></article>' +
              '<a class="next" href="/search-next">Next page</a>',
          );
        }
      } else {
        response.setHeader('Set-Cookie', 'tracker-session=fixture; Path=/; SameSite=Lax');
        response.end('<title>Tracker fixture</title>');
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Fixture did not start');
      const origin = `http://127.0.0.1:${address.port}`;
      const tracker = {
        version: 3,
        type: 'kit',
        description: {name: 'Test tracker', requestMode: 'tab'},
        search: {url: `${origin}/search?q=%search%`},
        selectors: {
          row: {selector: 'article'},
          title: {selector: 'a', pipeline: [{name: 'getText'}]},
          url: {selector: 'a', pipeline: [{name: 'getAttr', args: ['href']}]},
          nextPageUrl: {selector: '.next', pipeline: [{name: 'getAttr', args: ['href']}]},
        },
      };
      definition = JSON.stringify(tracker);
      await worker.evaluate(
        async ({origin, definition, enableProxy, mode}) => {
          await chrome.storage.local.set({
            lastCheckUpdateAt: Math.floor(Date.now() / 1000),
            profileId: 'fixture',
            trackers: enableProxy
              ? {
                  fixture: {
                    id: 'fixture',
                    meta: {
                      name: 'Test tracker',
                      connect: [origin],
                      require: ['exKit'],
                      requestMode: 'tab',
                    },
                    code: `// ==UserScript==\n// ==/UserScript==\n\nconst code = ${definition};\nAPI_exKit(code);`,
                  },
                }
              : {},
          });
          await chrome.storage.sync.set({
            profiles: [
              {
                id: 'fixture',
                name: 'Fixture',
                trackers: [
                  {
                    id: 'fixture',
                    options: mode === 'tab' ? {} : {enableProxy},
                  },
                ],
              },
            ],
          });
        },
        {origin, definition, enableProxy, mode},
      );

      const popup = await context.newPage();
      if (mode === 'window') {
        await popup.goto(`${url}/index.html#/options/main`);
        const selector = popup.getByRole('combobox', {name: 'Open tracker pages in'});
        await expect(selector).toHaveValue('tab');
        await selector.selectOption('window');
        await expect(selector).toBeEnabled();
        await popup.reload();
        await expect(selector).toHaveValue('window');
      }
      const trackerWindows = () =>
        worker.evaluate(async (origin) => {
          const windows = await chrome.windows.getAll({populate: true});
          return windows.flatMap(({type, tabs, left, top, width, height}) =>
            (tabs ?? [])
              .filter(({url}) => url === origin + '/')
              .map(() => ({type, left, top, width, height})),
          );
        }, origin);
      await popup.goto(`${url}/popup.html`);
      if (!enableProxy) {
        const reply = await popup.evaluate(
          (downloadURL) =>
            chrome.runtime.sendMessage({
              action: 'downloadTracker',
              id: 'fixture',
              downloadURL,
            }),
          `${origin}/tracker.json`,
        );
        expect(reply).toEqual({result: true});
      }
      await popup.getByRole('combobox').fill('Big Buck Bunny');
      const openedPage = context.waitForEvent('page');
      await popup.getByRole('combobox').press('Enter');
      const search = await openedPage;
      if (enableProxy) {
        await expect
          .poll(trackerWindows)
          .toMatchObject([{type: mode === 'window' ? 'popup' : 'normal'}]);
        await expect.poll(() => firstRequestReceived).toBe(true);
        if (mode === 'window') {
          const workArea = await search.evaluate(() => {
            const display = screen as Screen & {availLeft?: number; availTop?: number};
            return {
              right: (display.availLeft ?? 0) + display.availWidth,
              bottom: (display.availTop ?? 0) + display.availHeight,
            };
          });
          const [{left, top, width, height}] = await trackerWindows();
          expect(width).toBeLessThanOrEqual(260);
          expect(height).toBeLessThanOrEqual(180);
          expect(Math.abs(left! + width! - workArea.right)).toBeLessThan(32);
          expect(Math.abs(top! + height! - workArea.bottom)).toBeLessThan(32);
        }
        finishFirstRequest.resolve();
      }
      await expect(search.getByText('Big Buck Bunny test result')).toBeVisible();
      await expect(search.getByText('Big Buck Bunny test result')).toHaveAttribute(
        'href',
        `${origin}/item`,
      );
      await expect.poll(trackerWindows).toEqual([]);
      const loadMore = search.getByRole('button', {name: 'Load more'});
      const measureButton = () =>
        loadMore.evaluate((button) => {
          const bounds = button.getBoundingClientRect();
          const label = button.querySelector('.ts-button-label')!.getBoundingClientRect();
          return {
            width: bounds.width,
            imbalance: Math.abs(label.left - bounds.left - (bounds.right - label.right)),
          };
        });
      await expect(loadMore).toBeVisible();
      const initial = mode === 'direct' ? await measureButton() : undefined;
      await loadMore.press('Space');
      await expect.poll(() => nextPageRequests).toBe(1);
      if (initial) {
        await expect(loadMore).toHaveAttribute('aria-busy', 'true');
        const loading = await measureButton();
        expect(loading.width).toBeCloseTo(initial.width);
        expect(loading.imbalance).toBeLessThan(1);
      }
      finishFailedPage.resolve();
      await expect(loadMore).toBeEnabled();
      const error = search.getByRole('button', {name: 'Tracker error'});
      await expect(error).toBeVisible();
      if (initial) {
        const retry = await measureButton();
        expect(retry.width).toBeCloseTo(initial.width);
        expect(retry.imbalance).toBeLessThan(1);
      }
      await expect.poll(trackerWindows).toEqual([]);
      await expect(loadMore).toBeFocused();
      await expect(search.getByRole('link', {name: 'Big Buck Bunny test result'})).toBeVisible();
      if (mode === 'direct') {
        await error.hover();
        await expect(search.getByText('The tracker returned HTTP 500.')).toBeVisible();
        const retry = search.getByRole('button', {name: 'Retry search', exact: true});
        await retry.hover();
        await retry.click();
      } else {
        await loadMore.press('Enter');
      }
      await expect(search.getByRole('link', {name: 'Next page result'})).toHaveAttribute(
        'href',
        `${origin}/next-item`,
      );
      await loadMore.press('Enter');
      await expect(search.getByRole('link', {name: 'Last page result'})).toHaveAttribute(
        'href',
        `${origin}/last-item`,
      );
      await expect(loadMore).toHaveCount(0);
      await expect(search.getByRole('link', {name: 'Last page result'})).toBeFocused();
    } finally {
      finishFirstRequest.resolve();
      finishFailedPage.resolve();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
}

test('a packaged tracker parses a result in the sandbox', async ({extension}) => {
  const {context, worker, url} = extension;
  await context.route('https://booktracker.org/tracker.php?**', (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body:
        '<table id="tor-tbl"><tbody><tr><td></td><td></td><td></td>' +
        '<td class="row4 med tLeft"><a href="/viewtopic.php?t=42">Packaged tracker result</a></td>' +
        '</tr></tbody></table>',
    }),
  );
  await worker.evaluate(async () => {
    await chrome.storage.local.set({
      lastCheckUpdateAt: Math.floor(Date.now() / 1000),
      profileId: 'packaged',
    });
    await chrome.storage.sync.set({
      profiles: [{id: 'packaged', name: 'Packaged', trackers: [{id: 'booktracker'}]}],
    });
  });
  const page = await context.newPage();
  await page.goto(`${url}/index.html#/search?query=tracker`);
  const result = page.getByRole('link', {name: 'Packaged tracker result'});
  await expect(result).toHaveAttribute('href', 'https://booktracker.org/viewtopic.php?t=42');
  const filter = page.locator('input[name="textFilter"]');
  await filter.fill('a word absent from the result');
  await expect(result).toHaveCount(0);
  await filter.clear();
  await expect(result).toBeVisible();
  await page.getByRole('link', {name: 'History', exact: true}).click();
  await expect(page.getByText('tracker', {exact: true})).toBeVisible();
});

test('seeders and leechers independently change quality sorting', async ({extension}) => {
  const {context, worker, url} = extension;
  const row = (id: number, seeds: string, leeches: string) =>
    '<tr><td></td><td></td><td></td>' +
    `<td class="row4 med tLeft"><a href="/viewtopic.php?t=${id}">Sample release</a></td>` +
    `<td class="row4 seedmed">${seeds}</td><td class="row4 leechmed">${leeches}</td></tr>`;
  await context.route('https://booktracker.org/tracker.php?**', (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body:
        '<table id="tor-tbl"><tbody>' +
        row(41, '42', '0') +
        row(42, '0', '42') +
        row(43, '', '') +
        '</tbody></table>',
    }),
  );
  await worker.evaluate(async () => {
    await chrome.storage.local.set({
      lastCheckUpdateAt: Math.floor(Date.now() / 1000),
      profileId: 'packaged',
    });
    await chrome.storage.sync.set({
      profiles: [{id: 'packaged', name: 'Packaged', trackers: [{id: 'booktracker'}]}],
    });
  });
  const settings = await context.newPage();
  await settings.goto(`${url}/index.html#/options`);
  const seeds = settings.getByRole('checkbox', {name: /consider seeders/i});
  const leeches = settings.getByRole('checkbox', {name: /consider leechers/i});
  const savedOptions = () =>
    worker.evaluate(async () => {
      const {options} = await chrome.storage.sync.get({
        options: {rankBySeeds: false, rankByLeeches: false},
      });
      return options;
    });
  await expect(seeds).not.toBeChecked();
  await expect(leeches).not.toBeChecked();

  const search = await context.newPage();
  await search.goto(`${url}/index.html#/search?query=Sample`);
  const results = search.getByRole('link', {name: 'Sample release'});
  const scores = search.locator('.quality_value');
  await expect(results).toHaveCount(3);
  const baseline = await scores.first().innerText();
  await expect(scores).toHaveText([baseline, baseline, baseline]);

  await seeds.check();
  await expect.poll(savedOptions).toMatchObject({rankBySeeds: true, rankByLeeches: false});
  await search.reload();
  await expect(results).toHaveCount(3);
  await expect(results.first()).toHaveAttribute('href', /\?t=41$/);
  await expect(scores.first()).not.toHaveText(baseline);
  await expect(scores.nth(1)).toHaveText(baseline);
  await expect(scores.nth(2)).toHaveText(baseline);

  await seeds.uncheck();
  await leeches.check();
  await expect.poll(savedOptions).toMatchObject({rankBySeeds: false, rankByLeeches: true});
  await settings.reload();
  await expect(seeds).not.toBeChecked();
  await expect(leeches).toBeChecked();
  await search.reload();
  await expect(results).toHaveCount(3);
  await expect(results.first()).toHaveAttribute('href', /\?t=42$/);
  await expect(scores.first()).not.toHaveText(baseline);
  await expect(scores.nth(1)).toHaveText(baseline);
  await expect(scores.nth(2)).toHaveText(baseline);
});

test('checked quality imports are drafts until saved and update an open search', async ({
  extension,
}) => {
  const {context, worker, url} = extension;
  await context.route('https://booktracker.org/tracker.php?**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body:
        '<table id="tor-tbl"><tbody>' +
        ['Sintel Alpha', 'Sintel Beta']
          .map(
            (title, index) =>
              `<tr><td></td><td></td><td></td><td class="row4 med tLeft"><a href="/viewtopic.php?t=${index + 21}">${title}</a></td></tr>`,
          )
          .join('') +
        '</tbody></table>',
    }),
  );
  await worker.evaluate(async () => {
    await chrome.storage.local.set({
      lastCheckUpdateAt: Math.floor(Date.now() / 1000),
      profileId: 'quality-fixture',
    });
    await chrome.storage.sync.set({
      profiles: [{id: 'quality-fixture', name: 'Quality fixture', trackers: [{id: 'booktracker'}]}],
    });
  });
  const search = await context.newPage();
  await search.goto(`${url}/index.html#/search?query=Sintel&theme=light`);
  const titles = search.locator('.results-table .title');
  await expect(titles).toHaveText(['Sintel Alpha', 'Sintel Beta']);

  const settings = await context.newPage();
  await settings.setViewportSize({width: 540, height: 900});
  await settings.goto(`${url}/index.html#/options/quality?theme=dark`);
  await settings.getByRole('button', {name: 'Import and export JSON'}).click();
  const dialog = settings.getByRole('dialog');
  const apply = dialog.getByRole('button', {name: 'Apply to draft'});
  const json = dialog.getByLabel('JSON to import');
  const check = dialog.getByRole('button', {name: 'Check JSON'});
  await expect(apply).toBeDisabled();
  await json.fill('{"version":2}');
  await check.click();
  await expect(json).toHaveAccessibleDescription(/Only version 1/);
  await expect(apply).toBeDisabled();
  await json.fill(
    JSON.stringify({
      version: 1,
      rules: [
        {
          title: 'Prefer beta',
          patterns: [{text: 'Beta'}],
          weights: [{criterion: 'video', points: 100.5}],
        },
      ],
    }),
  );
  await check.click();
  await expect(dialog.getByRole('status')).toHaveText('Add: 1. Update: 0. Replace: 0.');
  await apply.click();
  await expect(titles).toHaveText(['Sintel Alpha', 'Sintel Beta']);

  const save = settings.getByRole('button', {name: 'Save', exact: true});
  const general = await context.newPage();
  await general.goto(`${url}/index.html#/options/main`);
  await general.getByRole('checkbox', {name: /consider seeders/i}).check();
  await expect(settings.getByRole('alert')).toHaveText(/Another tab saved changes/);
  await expect(save).toBeDisabled();
  await settings.getByRole('button', {name: 'Refresh', exact: true}).click();
  await expect(settings.getByRole('alert')).toHaveCount(0);

  await settings.getByRole('button', {name: 'Import and export JSON'}).click();
  await json.fill(
    JSON.stringify({
      version: 1,
      rules: [
        {
          title: 'Prefer beta',
          patterns: [{text: 'Beta'}],
          weights: [{criterion: 'video', points: 100.5}],
        },
      ],
    }),
  );
  await check.click();
  await apply.click();
  await save.click();
  await expect(titles).toHaveText(['Sintel Beta', 'Sintel Alpha']);
  await expect(save).toBeDisabled();
  await settings.reload();
  await settings.getByLabel('Find rules').fill('Prefer beta');
  await expect(settings.getByRole('spinbutton', {name: 'Points: Prefer beta'})).toHaveValue(
    '100.5',
  );

  await settings.getByRole('button', {name: 'Restore defaults'}).click();
  await save.click();
  await expect(titles).toHaveText(['Sintel Alpha', 'Sintel Beta']);
});

test('the background rejects a download containing executable code', async ({extension}) => {
  const {context, url} = extension;
  const script = await readFile(new URL('../../external/uniongang_tv.user.js', import.meta.url));
  const server = createServer((_request, response) => {
    response.end(script);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Fixture did not start');
    const page = await context.newPage();
    await page.goto(`${url}/popup.html`);
    const result = await page.evaluate(async (downloadURL) => {
      const reply = await chrome.runtime.sendMessage({
        action: 'downloadTracker',
        id: 'external-script',
        downloadURL,
      });
      const {trackers} = await chrome.storage.local.get<{trackers: Record<string, unknown>}>({
        trackers: {},
      });
      return {error: reply?.error?.name, saved: Object.hasOwn(trackers, 'external-script')};
    }, `http://127.0.0.1:${address.port}/tracker.js`);
    expect(result).toEqual({error: 'SyntaxError', saved: false});
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('the JSON editor saves a tracker and reopens its definition', async ({extension}) => {
  const {context, worker, url} = extension;
  await worker.evaluate(() =>
    chrome.storage.local.set({
      lastCheckUpdateAt: Math.floor(Date.now() / 1000),
    }),
  );
  const page = await context.newPage();
  await page.goto(`${url}/index.html#/editor/tracker/fixture-editor`);
  const editor = page.getByRole('textbox', {name: /tracker code/i});
  const code = {
    version: 3,
    type: 'kit',
    description: {name: 'Editor test tracker'},
    search: {url: 'https://example.invalid/search?q=%search%'},
    selectors: {row: {selector: 'article'}},
  };
  await editor.fill(JSON.stringify(code));
  await page.getByRole('button', {name: 'Save*', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Save', exact: true})).toBeVisible();
  await page.reload();
  await expect(editor).toContainText('Editor test tracker');
});

test('the code maker previews a result and saves the suggested tracker section', async ({
  extension,
}) => {
  const {context, url} = extension;
  const fixture = 'https://code-maker.example.test/results';
  await context.route(fixture, (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body:
        '<article><a class="title" href="/item">Code maker fixture result</a>' +
        '<a class="category" href="/category/documentaries"><span>Documentaries</span></a>' +
        '<span class="section-label">Manual label</span></article>',
    }),
  );

  const page = await context.newPage();
  await page.goto(`${url}/index.html#/codeMaker/search`);
  await page.locator('[data-id="url"]').fill(fixture);
  await page.getByRole('button', {name: 'Open for manual setup'}).click();
  await expect(page.frameLocator('iframe').getByText('Code maker fixture result')).toBeVisible();
  await page.locator('a[href="#/codeMaker/selectors"]').click();
  const row = page.locator('[data-id="row"]');
  await row.fill('article');
  await row.press('End');
  const title = page.locator('[data-id="title"]');
  await title.fill('.title');
  await title.press('End');
  await expect(page.locator('[data-id="title-result"]')).toHaveValue('Code maker fixture result');

  await page.locator('.maker-selector [data-id="url"]').fill('.title');
  const section = page.getByRole('checkbox', {name: 'Tracker section'});
  await section.check();
  await page.locator('[data-id="categoryTitle-btn"]').click();
  await page.frameLocator('iframe').getByText('Documentaries', {exact: true}).click();
  const sectionLink = page.locator('[data-id="categoryUrl-result"]');
  await page.locator('[data-id="categoryUrl"]').press('End');
  await expect(sectionLink).toHaveValue('https://code-maker.example.test/category/documentaries');

  await section.uncheck();
  await page.getByRole('button', {name: 'Use suggested section: Documentaries'}).click();
  await expect(page.locator('[data-id="categoryTitle-result"]')).toHaveValue('Documentaries');
  await page.locator('[data-id="categoryUrl"]').press('End');
  await expect(sectionLink).toHaveValue('https://code-maker.example.test/category/documentaries');
  await page.getByRole('link', {name: 'Result', exact: true}).click();
  await page.getByRole('button', {name: 'Run check'}).click();
  await page.getByRole('button', {name: 'Continue to code'}).click();
  await page.getByRole('button', {name: 'Generate JSON'}).click();
  const code = JSON.parse(await page.locator('[data-id="save_code_textarea"]').inputValue());
  expect(code.selectors.categoryUrl.selector).toBe(code.selectors.categoryTitle.selector);

  const separateLink = {...code.selectors.categoryUrl, selector: 'a[href^="/category/"]'};
  code.selectors.categoryUrl = separateLink;
  await page.getByRole('button', {name: 'Import JSON'}).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill(JSON.stringify(code));
  await dialog.getByRole('button', {name: 'Import JSON'}).click();
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await page.getByRole('button', {name: 'Run check'}).click();
  await page.getByRole('link', {name: 'Fields', exact: true}).click();
  await page.locator('[data-id="categoryTitle"]').fill('.section-label');
  await expect(page.locator('[data-id="categoryTitle-result"]')).toHaveValue('Manual label');
  await page.getByRole('link', {name: 'Result', exact: true}).click();
  await page.getByRole('button', {name: 'Run check'}).click();
  await page.getByRole('button', {name: 'Continue to code'}).click();
  await page.getByRole('button', {name: 'Generate JSON'}).click();
  const saved = JSON.parse(await page.locator('[data-id="save_code_textarea"]').inputValue());
  expect(saved.selectors.categoryUrl).toEqual(separateLink);
});

test('the code maker divider keeps its position and works over the preview', async ({
  extension,
}) => {
  const {context, url} = extension;
  const fixture = 'https://code-maker.example.test/panel';
  await context.route(fixture, (route) =>
    route.fulfill({contentType: 'text/html', body: '<article>Preview fixture</article>'}),
  );
  const page = await context.newPage();
  await page.setViewportSize({width: 520, height: 740});
  await page.goto(`${url}/index.html#/codeMaker/search?theme=dark`);
  await page.locator('[data-id="url"]').fill(fixture);
  await page.getByRole('button', {name: 'Open for manual setup'}).click();
  const preview = page.frameLocator('iframe').getByText('Preview fixture');
  await expect(preview).toBeVisible();
  await expect(page.frameLocator('iframe').locator('html')).toHaveCSS('color-scheme', 'dark');
  const split = page.getByRole('separator', {name: 'Resize form and tracker preview'});
  const position = async () => Number(await split.getAttribute('aria-valuenow'));
  const original = await position();
  const box = (await split.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 100, {steps: 10});
  await page.mouse.up();
  await expect.poll(position).toBeGreaterThan(original + 5);
  await expect(preview).toBeVisible();
  const afterMouse = await position();
  const touch = await context.newCDPSession(page);
  await touch.send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1});
  const target = (await split.boundingBox())!;
  const touchX = target.x + target.width / 2;
  const touchY = target.y + target.height / 2;
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{x: touchX, y: touchY}],
  });
  for (const offset of [14, 45, 75]) {
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{x: touchX, y: touchY - offset}],
    });
  }
  await touch.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await expect.poll(position).toBeLessThan(afterMouse - 4);
  await touch.detach();
  await split.focus();
  await page.keyboard.press('Home');
  const minimum = Number(await split.getAttribute('aria-valuemin'));
  await expect.poll(position).toBe(minimum);
  await page.keyboard.press('ArrowDown');
  const stored = await position();
  expect(stored).toBeGreaterThan(minimum);
  await page.getByRole('button', {name: 'Collapse preview'}).click();
  await page.getByRole('button', {name: 'Tracker page'}).click();
  await expect.poll(position).toBe(stored);
  await page.reload();
  await expect(page).toHaveURL(/codeMaker\/selectors\?theme=dark/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('profile catalog keeps successful sources and installs a definition', async ({extension}) => {
  const {context, worker, url} = extension;
  const origin = 'https://catalog.example.test';
  const source = origin + '/files';
  const broken = origin + '/unavailable';
  const download = origin + '/example.json';
  await worker.evaluate(
    async ({source, broken}) => {
      await chrome.storage.sync.set({
        options: {repositories: [source, broken]},
        profiles: [{id: 'catalogue', name: 'Catalog fixture', trackers: []}],
      });
    },
    {source, broken},
  );
  await context.route(source, (route) =>
    route.fulfill({
      json: [{type: 'file', name: 'Example.json', html_url: source, download_url: download}],
    }),
  );
  await context.route(broken, (route) => route.fulfill({status: 503}));
  await context.route(download, (route) =>
    route.fulfill({
      json: {
        version: 3,
        type: 'kit',
        description: {name: 'Catalog tracker'},
        search: {url: origin + '/search?title=%search%'},
        selectors: {
          row: {selector: 'article'},
          title: {selector: 'a', pipeline: [{name: 'getText'}]},
          url: {selector: 'a', pipeline: [{name: 'getProp', args: ['href']}]},
        },
      },
    }),
  );
  const page = await context.newPage();
  await page.goto(`${url}/index.html#/options/profiles/catalogue?theme=light`);
  await page.getByRole('button', {name: 'External', exact: true}).click();
  await expect(page.getByRole('alert')).toContainText('Some catalog sources are unavailable');
  await expect(page.getByText('Example.json', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: /metadata/i}).click();
  await expect(page.getByText('Catalog tracker', {exact: true})).toBeVisible();
  const row = page.locator('.tracker-editor-row').filter({hasText: 'Catalog tracker'});
  await row.getByRole('button', {name: 'Add', exact: true}).click();
  await expect(row.getByRole('button', {name: 'Update', exact: true})).toBeVisible();
  await expect
    .poll(() =>
      worker.evaluate(async () => {
        const {trackers} = await chrome.storage.local.get('trackers');
        return Object.values(trackers ?? {}).length;
      }),
    )
    .toBe(1);
});

test('the profile editor saves a tracker option with the selected tracker', async ({extension}) => {
  const {context, worker, url} = extension;
  await worker.evaluate(async () => {
    await chrome.storage.local.set({
      lastCheckUpdateAt: Math.floor(Date.now() / 1000),
      profileId: 'profile-fixture',
    });
    await chrome.storage.sync.set({
      profiles: [{id: 'profile-fixture', name: 'Profile fixture', trackers: [{id: 'booktracker'}]}],
    });
  });

  const page = await context.newPage();
  await page.goto(`${url}/index.html#/profileEditor/profile-fixture?theme=dark&from=legacy`);
  await expect(page).toHaveURL(/#\/options\/profiles\/profile-fixture\?theme=dark&from=legacy$/);
  await expect(page.getByRole('textbox', {name: 'List name'})).toHaveValue('Profile fixture');
  await page.getByRole('checkbox', {name: 'Requests via site tab'}).check();
  await page.getByRole('button', {name: /^Built-in\b/}).click();
  const rutracker = page.locator('.tracker-editor-row[data-id="rutracker"]');
  await rutracker.getByRole('checkbox', {name: 'Рутрекер', exact: true}).check();
  const useTab = rutracker.getByRole('checkbox', {name: 'Requests via site tab'});
  await expect(useTab).toBeChecked();
  await useTab.uncheck();
  await page.getByRole('button', {name: 'Save', exact: true}).click();
  await expect
    .poll(() =>
      worker.evaluate(async () => {
        const {profiles} = await chrome.storage.sync.get<{
          profiles: {trackers: {options?: {enableProxy?: boolean}}[]}[];
        }>('profiles');
        return profiles?.[0]?.trackers[0]?.options?.enableProxy;
      }),
    )
    .toBe(true);
  await page.reload();
  await expect(
    page.locator('.tracker-editor-row[data-id="booktracker"]').getByRole('checkbox', {
      name: 'Requests via site tab',
    }),
  ).toBeChecked();
  await expect(useTab).toBeVisible();
  await expect(useTab).not.toBeChecked();
});

test('the explorer loads a packaged module and persists a favorite', async ({extension}) => {
  const {context, worker, url} = extension;
  let refreshGate: Promise<void> | undefined;
  const release = (day: number, slug: string, title: string) => `
    <div class="calendar-news">
      <div class="calendar-date">${day}</div>
      <div class="calendar-news-title"><a href="/game/${slug}/">${title}</a></div>
    </div>`;
  await context.route('https://gameguru.ru/calendar/**', async (route) => {
    await refreshGate;
    const currentMonth = new URL(route.request().url()).pathname === '/calendar/1/2026/pc/';
    return route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body:
        '<a class="active" data-month="1">Month</a>' +
        (currentMonth
          ? release(14, 'fixture', 'Explorer fixture game') + release(16, 'future', 'Upcoming game')
          : release(31, 'previous', 'Previous month game')),
    });
  });
  await worker.evaluate(async () => {
    await chrome.storage.local.set({lastCheckUpdateAt: Math.floor(Date.now() / 1000)});
    await chrome.storage.sync.set({
      options: {explorerSections: {tmdbInCinema: false, tmdbPopular: false, tmdbSeries: false}},
      explorerSections: [
        {id: 'favorites', moduleId: 'favorites'},
        {id: 'ggGamesNew', moduleId: 'ggGamesNew'},
      ],
    });
  });

  const page = await context.newPage();
  await page.clock.install({time: new Date('2026-01-15T12:00:00Z')});
  await page.goto(`${url}/index.html`);
  const games = page.locator('.section', {hasText: 'Games: New'});
  const favoritesToggle = page.getByRole('button', {name: 'Favorites', exact: true});
  const favorites = page.locator('.section').filter({has: favoritesToggle});
  const name = 'Explorer fixture game';
  await expect(games.locator('.poster__title')).toHaveText([name, 'Previous month game']);
  await expect(favoritesToggle).toBeHidden();
  const card = games.locator('.poster', {hasText: name});
  await games.getByRole('button', {name: 'Customize'}).click();
  const size = games.getByRole('slider', {name: 'Poster size'});
  const savedZoom = () =>
    worker.evaluate(async () => {
      const {explorerSections} = await chrome.storage.sync.get<{
        explorerSections: {id: string; zoom?: number}[];
      }>('explorerSections');
      return explorerSections?.find(({id}) => id === 'ggGamesNew')?.zoom;
    });
  await size.press('ArrowLeft');
  await expect(size).toHaveValue('99');
  await expect.poll(savedZoom).toBe(99);
  await games.getByRole('button', {name: 'Reset poster size'}).click();
  await expect(size).toHaveValue('100');
  await expect.poll(savedZoom).toBe(100);
  const refresh = games.getByRole('button', {name: 'Refresh collection'});
  const waiting = Promise.withResolvers<void>();
  refreshGate = waiting.promise;
  try {
    await refresh.press('Enter');
    await expect(refresh).toHaveAttribute('aria-busy', 'true');
    await expect(refresh).toBeFocused();
    await expect(card.getByText(name)).toBeVisible();
  } finally {
    waiting.resolve();
  }
  await expect(refresh).toBeEnabled();
  await expect(refresh).toBeFocused();
  await card.locator('.poster__image').hover();
  await card.getByRole('button', {name: 'Add to favorites'}).click();
  await expect(favorites.getByText(name, {exact: true})).toBeVisible();
  await page.reload();
  await expect(favorites.getByText(name, {exact: true})).toBeVisible();
  await favorites.locator('.poster__image').hover();
  await favorites.getByRole('button', {name: 'Remove from favorites'}).click();
  await expect(favoritesToggle).toBeHidden();
  await page.reload();
  await expect(games.getByText(name, {exact: true})).toBeVisible();
  await expect(favoritesToggle).toBeHidden();
});

const mockPoster = 'https://images.example.test/explorer.png';

async function seedExplorer(worker: Worker, sectionIds: string[]) {
  await worker.evaluate(async (sectionIds) => {
    await chrome.storage.local.set({lastCheckUpdateAt: Math.floor(Date.now() / 1000)});
    await chrome.storage.sync.set({
      explorerSections: sectionIds.map((id) => ({
        id,
        moduleId: id,
        moduleParams: id === 'kpFavorites' ? 'categoryId=6' : '',
      })),
    });
  }, sectionIds);
}

const searchOrigin = 'https://search-fixture.example.test';
const sourceNames = {
  fast: 'Short film tracker',
  slow: 'Independent Animation Archive and Public Domain Documentary Collection',
};

async function seedSearchSources(worker: Worker) {
  const trackers = Object.fromEntries(
    Object.entries(sourceNames).map(([id, name]) => [
      id,
      {
        id,
        ...prepareTrackerDefinition(
          JSON.stringify({
            version: 3,
            type: 'kit',
            description: {name},
            search: {url: `${searchOrigin}/${id}?q=%search%`},
            selectors: {
              row: {selector: 'article'},
              title: {selector: 'a', pipeline: [{name: 'getText'}]},
              url: {selector: 'a', pipeline: [{name: 'getAttr', args: ['href']}]},
              size: {selector: '.size', pipeline: [{name: 'getText'}]},
              nextPageUrl: {
                selector: 'a[rel="next"]',
                pipeline: [{name: 'getAttr', args: ['href']}],
              },
            },
          }),
        ),
      },
    ]),
  );
  await worker.evaluate(async (trackers) => {
    await chrome.storage.local.set({
      trackers,
      lastCheckUpdateAt: Math.floor(Date.now() / 1000),
      profileId: 'films',
    });
    await chrome.storage.sync.set({
      profiles: [
        {id: 'films', name: 'Films', trackers: Object.keys(trackers).map((id) => ({id}))},
        {id: 'empty', name: 'Empty list', trackers: []},
      ],
      explorerFavorites: [
        {title: 'Big Buck Bunny', url: 'https://collection.example.test/bunny'},
        {title: 'Sintel', url: 'https://collection.example.test/sintel'},
      ],
    });
  }, trackers);
}

test('explorer sections collapse smoothly and drag with a header-only preview', async ({
  extension,
}) => {
  const {context, worker, url} = extension;
  await seedExplorer(worker, ['favorites', 'imdbPopular']);
  await seedSearchSources(worker);
  const brokenPoster = 'https://images.example.test/broken-poster.png';
  await worker.evaluate(
    async ({brokenPoster, mockPoster}) => {
      const {explorerFavorites} = await chrome.storage.sync.get<{explorerFavorites: object[]}>(
        'explorerFavorites',
      );
      await chrome.storage.sync.set({
        explorerFavorites: explorerFavorites?.map((item, index) => ({
          ...item,
          poster: index === 0 ? brokenPoster : mockPoster,
        })),
      });
    },
    {brokenPoster, mockPoster},
  );
  await context.route(brokenPoster, (route) => route.fulfill({status: 404}));
  await context.route('https://www.imdb.com/chart/moviemeter/', (route) =>
    route.fulfill({status: 503}),
  );
  const page = await context.newPage();
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.goto(`${url}/index.html`);
  const favorites = page.locator('[data-id="favorites"]');
  const category = favorites.getByRole('button', {name: 'Favorites', exact: true});
  const posters = favorites.locator('.poster__title');
  await expect(posters).toHaveText(['Big Buck Bunny', 'Sintel']);
  await expect(favorites.locator('.image__placeholder')).toBeVisible();
  const images = favorites.locator('.image__search_link').locator('span.image__placeholder, img');
  const [fallbackHeight, loadedHeight] = await images.evaluateAll((items) =>
    items.map((item) => item.getBoundingClientRect().height),
  );
  expect(fallbackHeight).toBeCloseTo(loadedHeight);

  const heights = await category.evaluate(async (button) => {
    if (!(button instanceof HTMLButtonElement)) throw new Error('Missing collection button');
    const panel = document.getElementById(button.getAttribute('aria-controls')!);
    if (!panel) throw new Error('Missing collection content');
    const expanded = panel.getBoundingClientRect().height;
    const transition = new Promise<Animation>((resolve, reject) => {
      panel.addEventListener(
        'transitionrun',
        () => {
          const animation = panel.getAnimations()[0];
          if (animation) resolve(animation);
          else reject(new Error('Missing collapse transition'));
        },
        {once: true},
      );
    });
    button.click();
    const animation = await transition;
    animation.pause();
    animation.currentTime = Number(animation.effect?.getTiming().duration) / 2;
    const collapsing = panel.getBoundingClientRect().height;
    animation.finish();
    return {expanded, collapsing};
  });
  expect(heights.collapsing).toBeGreaterThan(0);
  expect(heights.collapsing).toBeLessThan(heights.expanded);
  await expect(posters).toHaveCount(0);
  await category.click();
  await expect(posters.first()).toBeVisible();

  const pick = await favorites.getByRole('button', {name: 'Move: Favorites'}).boundingBox();
  expect(pick).not.toBeNull();
  await page.mouse.move(pick!.x + 10, pick!.y + 10);
  await page.mouse.down();
  await page.mouse.move(pick!.x + 25, pick!.y + 10, {steps: 4});
  const preview = page.locator('.section__drag-preview');
  await expect(preview).toHaveText('Favorites');
  await expect(posters.first()).toBeHidden();
  const target = await page.locator('[data-id="imdbPopular"] .section__head').boundingBox();
  expect(target).not.toBeNull();
  await page.mouse.move(target!.x + 25, target!.y + target!.height / 2, {steps: 12});
  await page.mouse.up();
  await expect(page.locator('.explore > .section').first()).toHaveAttribute(
    'data-id',
    'imdbPopular',
  );
  await expect(posters.first()).toBeVisible();
  await page.reload();
  await expect(page.locator('.explore > .section').first()).toHaveAttribute(
    'data-id',
    'imdbPopular',
  );

  const bunny = favorites.locator('[data-url="https://collection.example.test/bunny"]');
  const sintel = favorites.locator('[data-url="https://collection.example.test/sintel"]');
  await bunny.hover();
  const cardHandle = await bunny.getByRole('button', {name: 'Move', exact: true}).boundingBox();
  const cardTarget = await sintel.boundingBox();
  expect(cardHandle).not.toBeNull();
  expect(cardTarget).not.toBeNull();
  await page.mouse.move(
    cardHandle!.x + cardHandle!.width / 2,
    cardHandle!.y + cardHandle!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    cardTarget!.x + cardTarget!.width / 2,
    cardTarget!.y + cardTarget!.height / 2,
    {steps: 12},
  );
  await expect(sintel).toHaveAttribute('data-sort-target', 'true');
  await page.mouse.up();
  await expect(posters).toHaveText(['Sintel', 'Big Buck Bunny']);
});

test('profile and tracker order can be changed with the keyboard', async ({extension}) => {
  const {context, worker, url} = extension;
  await seedSearchSources(worker);
  const page = await context.newPage();
  await page.goto(`${url}/index.html#/options/profiles`);
  const profiles = page.locator('.manager__profiles .item__name');
  await expect(profiles).toHaveText(['Films', 'Empty list']);
  await page.getByRole('button', {name: 'Move: Films'}).press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect(profiles).toHaveText(['Empty list', 'Films']);
  const save = page.getByRole('button', {name: 'Save', exact: true});
  await save.click();
  await expect(save).toBeDisabled();
  await page.reload();
  await expect(profiles).toHaveText(['Empty list', 'Films']);

  await page.getByRole('link', {name: 'Films', exact: true}).click();
  const trackers = page.locator('.tracker-editor-row.item__selected');
  await expect(trackers.first()).toHaveAttribute('data-id', 'fast');
  await page.getByRole('button', {name: `Move: ${sourceNames.fast}`}).press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect(trackers.first()).toHaveAttribute('data-id', 'slow');
  await save.click();
  await expect(save).toBeDisabled();
  await page.reload();
  await expect(trackers.first()).toHaveAttribute('data-id', 'slow');
});

const releaseMarkup = (id: string, title: string, origin = '') =>
  `<article><a href="${origin}/release/${id}">${title}</a><div class="size">2147483648</div></article>`;

test('category changes update all result lists and keep the clicked filter in place', async ({
  extension,
}) => {
  const {context, worker, url} = extension;
  await seedSearchSources(worker);
  const releases = (page: number, books: number, other: number) =>
    Array.from({length: books + other}, (_, index) =>
      releaseMarkup(
        `${page}-${index}`,
        `Sintel ${index < books ? 'EPUB' : 'archive'} ${page}-${index}`,
      ),
    ).join('');
  await context.route(`${searchOrigin}/fast?**`, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: releases(1, 2, 16) + '<a rel="next" href="/page2">Next</a>',
    }),
  );
  await context.route(`${searchOrigin}/slow?**`, (route) =>
    route.fulfill({contentType: 'text/html', body: '<main />'}),
  );
  await context.route(`${searchOrigin}/page2`, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: releases(2, 15, 5) + '<a rel="next" href="/page3">Next</a>',
    }),
  );
  await context.route(`${searchOrigin}/page3`, (route) =>
    route.fulfill({contentType: 'text/html', body: releases(3, 1, 1)}),
  );
  const page = await context.newPage();
  await page.setViewportSize({width: 1000, height: 500});
  await page.goto(`${url}/index.html#/search?query=Sintel`);
  const more = page.getByRole('button', {name: 'Load more'});
  await more.click();
  const books = page.getByRole('button', {name: /^Books \d+$/});
  await expect(books).toHaveText(['Books 2', 'Books 15']);
  const second = books.nth(1);
  await second.evaluate((button) => window.scrollBy(0, button.getBoundingClientRect().top - 120));
  const top = () => second.evaluate((button) => button.getBoundingClientRect().top);
  const before = await top();
  await second.click();
  await expect(page.getByRole('button', {name: /^Books \d+$/, pressed: true})).toHaveCount(2);
  await expect(page.getByRole('link', {name: /Sintel archive/})).toHaveCount(0);
  await expect.poll(async () => Math.abs((await top()) - before)).toBeLessThan(2);
  await expect(second).toBeFocused();

  await more.click();
  await expect(page.getByRole('button', {name: /^Books \d+$/, pressed: true})).toHaveCount(3);
  await expect(page.getByRole('link', {name: 'Sintel EPUB 3-0'})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Sintel archive 3-1'})).toHaveCount(0);
});

test('normal search shows the first result and restores Search while another tracker runs', async ({
  extension,
}) => {
  const {context, worker, url} = extension;
  await seedSearchSources(worker);
  const site = createServer((_request, response) => response.end('Source release'));
  await new Promise<void>((resolve) => site.listen(0, '127.0.0.1', resolve));
  const address = site.address();
  if (!address || typeof address === 'string') throw new Error('Fixture did not start');
  const releaseOrigin = `http://127.0.0.1:${address.port}`;
  const fast = Promise.withResolvers<void>();
  const slow = Promise.withResolvers<void>();
  await context.route(`${searchOrigin}/fast?**`, async (route) => {
    await fast.promise;
    await route.fulfill({
      body: releaseMarkup('first', 'Sintel 1080p', releaseOrigin),
      contentType: 'text/html',
    });
  });
  await context.route(`${searchOrigin}/slow?**`, async (route) => {
    await slow.promise;
    await route.fulfill({
      body: releaseMarkup('second', 'Sintel 2160p', releaseOrigin),
      contentType: 'text/html',
    });
  });
  const page = await context.newPage();
  try {
    await page.goto(`${url}/index.html#/search?query=Sintel&theme=dark`);
    const submit = page.getByRole('button', {name: 'Search', exact: true});
    const loading = page.getByRole('status', {name: 'Searching trackers…'});
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await expect(loading).toHaveCount(2);
    const initialSize = await submit.boundingBox();
    const first = page.getByRole('link', {name: 'Sintel 1080p'});
    await expect(first).toHaveCount(0);
    fast.resolve();
    await expect(first).toBeVisible();
    await expect(submit).toBeEnabled();
    expect(await submit.boundingBox()).toEqual(initialSize);
    await expect(loading).toHaveCount(1);
    slow.resolve();
    const second = page.getByRole('link', {name: 'Sintel 2160p'});
    await expect(second).toBeVisible();
    await expect(loading).toHaveCount(0);

    const source = page.locator('.results-table').getByRole('img', {name: sourceNames.fast});
    await expect(source).toHaveCSS('opacity', '0.5');
    await source.hover();
    await expect(source).toHaveCSS('opacity', '1');
    await expect(page.getByRole('tooltip', {name: sourceNames.fast})).toBeVisible();

    const trackerRow = page.locator('.tracker').filter({hasText: sourceNames.fast});
    const tracker = trackerRow.getByRole('button', {name: sourceNames.fast, exact: true});
    const idleBackground = await trackerRow.evaluate(
      (row) => getComputedStyle(row).backgroundColor,
    );
    await tracker.click();
    await page.mouse.move(0, 0);
    await expect(tracker).toHaveAttribute('aria-pressed', 'true');
    await expect(second).toHaveCount(0);
    await tracker.click();
    await page.mouse.move(0, 0);
    await expect(tracker).toHaveAttribute('aria-pressed', 'false');
    await expect(tracker).toBeFocused();
    await expect(trackerRow).toHaveCSS('background-color', idleBackground);
    await expect(second).toBeVisible();

    for (const [link, file, middle] of [
      [first, 'first', false],
      [second, 'second', true],
    ] as const) {
      const tab = context.waitForEvent('page');
      if (middle) await link.click({button: 'middle'});
      else await link.press('Enter');
      const external = await tab;
      await expect(external).toHaveURL(`${releaseOrigin}/release/${file}`);
      await external.close();
    }
    await expect
      .poll(() =>
        worker.evaluate(async () => {
          const {history} = await chrome.storage.local.get<{history: Record<string, HistoryEntry>}>(
            'history',
          );
          return {
            count: history?.Sintel?.count,
            urls: Object.keys(history?.Sintel?.clicks ?? {}).sort(),
          };
        }),
      )
      .toEqual({
        count: 1,
        urls: [`${releaseOrigin}/release/first`, `${releaseOrigin}/release/second`],
      });
  } finally {
    fast.resolve();
    slow.resolve();
    site.closeAllConnections();
    await new Promise<void>((resolve) => site.close(() => resolve()));
  }
});

test('quick search restores results on hover, refreshes on click, and supports touch', async ({
  extension,
}) => {
  const {context, worker, url} = extension;
  await seedExplorer(worker, ['favorites']);
  await seedSearchSources(worker);
  const fast = Promise.withResolvers<void>();
  const slow = Promise.withResolvers<void>();
  const late = Promise.withResolvers<void>();
  let requests = 0;
  let outcome: 'partial' | 'late' | 'failed' | 'empty' = 'partial';
  const title =
    'Sintel 1080p ' + 'IndependentProductionFilmMasterWithMultilingualSubtitles '.repeat(4).trim();
  await context.route(`${searchOrigin}/fast?**`, async (route) => {
    requests++;
    const current = outcome;
    if (current === 'failed') return route.fulfill({status: 500});
    if (current === 'partial') await fast.promise;
    return route.fulfill({
      contentType: 'text/html',
      body:
        current === 'partial'
          ? ['sintel', 'b', 'c', 'd', 'e']
              .map((id, index) => releaseMarkup(id, index ? `${title} variant ${id}` : title))
              .join('')
          : current === 'late'
            ? releaseMarkup('fast', 'Sintel 720p')
            : '<main />',
    });
  });
  await context.route(`${searchOrigin}/slow?**`, async (route) => {
    requests++;
    const current = outcome;
    if (current === 'late') {
      await late.promise;
      return route.fulfill({contentType: 'text/html', body: releaseMarkup('late', 'Sintel 2160p')});
    }
    if (current === 'partial') await slow.promise;
    if (current !== 'empty') return route.fulfill({status: 500});
    return route.fulfill({contentType: 'text/html', body: '<main />'});
  });
  await context.route(`${searchOrigin}/release/**`, (route) =>
    route.fulfill({body: 'Quick release'}),
  );
  const page = await context.newPage();
  await page.setViewportSize({width: 320, height: 900});
  await page.goto(`${url}/index.html#/?theme=dark`);
  const poster = page.locator('.poster').filter({hasText: 'Sintel'});
  const quick = poster.getByRole('button', {name: 'Quick search'});
  const panel = poster.locator('.quick-search-panel');
  const errors = page.getByRole('button', {name: 'Tracker error'});
  const devtools = await context.newCDPSession(page);
  await devtools.send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1});

  try {
    await expect(poster.locator('.poster__actions')).toHaveCSS('opacity', '1');
    await expect(poster.getByRole('link', {name: 'Read more'})).toHaveAttribute(
      'href',
      'https://collection.example.test/sintel',
    );
    await expect(quick).toBeEnabled();
    await quick.press('Enter');
    await expect(quick).toHaveAttribute('aria-busy', 'true');
    await expect(panel).toHaveCount(0);
    fast.resolve();
    const match = panel.getByRole('link', {name: title, exact: true});
    await expect(match).toBeVisible();
    await expect(page.getByRole('status', {name: 'Searching trackers…'})).toHaveCount(1);
    await quick.press('Enter');
    await expect(panel).toHaveCount(0);
    await quick.press('Enter');
    await expect(match).toBeVisible();
    slow.resolve();
    await expect(errors).toHaveCount(1);
    const list = panel.getByRole('list');
    expect(await list.evaluate((element) => element.scrollHeight)).toBeGreaterThan(
      await list.evaluate((element) => element.clientHeight),
    );

    const bounds = await panel.boundingBox();
    const trigger = await quick.boundingBox();
    const arrow = await panel.locator('.ts-floating-arrow').boundingBox();
    expect(bounds).not.toBeNull();
    expect(trigger).not.toBeNull();
    expect(arrow).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(Math.abs(arrow!.x + arrow!.width / 2 - trigger!.x - trigger!.width / 2)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    await expect(panel.getByRole('link', {name: 'All results'})).toHaveAttribute(
      'href',
      /query=Sintel/,
    );
    const tab = context.waitForEvent('page');
    await match.press('Enter');
    const release = await tab;
    await expect(release).toHaveURL(`${searchOrigin}/release/sintel`);
    await release.close();
    await expect
      .poll(() =>
        worker.evaluate(async () => {
          const {history, quickSearch} = await chrome.storage.local.get<{
            history: Record<string, HistoryEntry>;
            quickSearch: Record<string, {results: QuickResult[]}>;
          }>(['history', 'quickSearch']);
          return [
            Object.keys(history?.Sintel?.clicks ?? {}),
            quickSearch?.Sintel?.results?.find(({url}) => url.endsWith('/sintel'))?.url,
          ];
        }),
      )
      .toEqual([[`${searchOrigin}/release/sintel`], `${searchOrigin}/release/sintel`]);
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(quick).toBeFocused();

    const requestsBeforeReload = requests;
    await page.reload();
    await expect(quick).toBeEnabled();
    const touchTarget = (await quick.boundingBox())!;
    await devtools.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        {x: touchTarget.x + touchTarget.width / 2, y: touchTarget.y + touchTarget.height / 2},
      ],
    });
    await devtools.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await expect(match).toBeVisible();
    expect(requests).toBe(requestsBeforeReload);
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);

    await devtools.send('Emulation.setTouchEmulationEnabled', {enabled: false});
    await poster.hover();
    await quick.hover();
    await expect(match).toBeVisible();
    expect(requests).toBe(requestsBeforeReload);

    const hoveredTrigger = (await quick.boundingBox())!;
    const panelSide = await panel.locator('.ts-floating-arrow').getAttribute('data-side');
    const gapY =
      panelSide === 'bottom' ? hoveredTrigger.y + hoveredTrigger.height + 4 : hoveredTrigger.y - 4;
    await page.mouse.move(hoveredTrigger.x + hoveredTrigger.width / 2, gapY);
    await expect(match).toBeVisible();
    await match.hover();
    await expect(match).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(panel).toHaveCount(0);

    outcome = 'late';
    await poster.hover();
    await quick.click();
    await expect(panel.getByRole('link', {name: 'Sintel 720p', exact: true})).toBeVisible();
    late.resolve();
    await expect(panel.getByRole('list').getByRole('link')).toHaveCount(2);
    await expect(panel.getByRole('link', {name: 'Sintel 2160p', exact: true})).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(panel).toHaveCount(0);

    outcome = 'failed';
    const requestsAfterRefresh = requests;
    await quick.press('Enter');
    await expect(panel.getByRole('list').getByRole('link')).toHaveCount(2);
    await expect(panel.getByRole('link', {name: 'Sintel 2160p', exact: true})).toBeVisible();
    await expect(panel.getByRole('link', {name: 'Sintel 720p', exact: true})).toBeVisible();
    expect(requests).toBe(requestsAfterRefresh);
    await panel.getByRole('button', {name: 'Refresh'}).press('Enter');
    await expect(errors).toHaveCount(2);
    await expect(quick).toBeEnabled();
    await expect(panel).toHaveCount(0);
    outcome = 'empty';
    await quick.press('Enter');
    await panel.getByRole('button', {name: 'Refresh'}).press('Enter');
    await expect(panel.getByRole('status')).toHaveText('No releases found.');
    await quick.press('Enter');
    await expect(panel).toHaveCount(0);
    await quick.press('Enter');
    await expect(panel).toBeVisible();
    await page.getByRole('combobox', {name: 'Search'}).click();
    await expect(panel).toHaveCount(0);
    await quick.press('Enter');
    await expect(panel).toBeVisible();
    const requestsAfterEmpty = requests;
    const reopened = await context.newPage();
    await reopened.goto(page.url());
    const reopenedCard = reopened.locator('.poster').filter({hasText: 'Sintel'});
    const reopenedQuick = reopenedCard.getByRole('button', {name: 'Quick search'});
    await expect(reopenedQuick).toBeEnabled();
    await reopenedQuick.press('Enter');
    await expect(reopenedCard.getByRole('status')).toHaveText('No releases found.');
    expect(requests).toBe(requestsAfterEmpty);
    await reopened.close();
    await page.getByRole('combobox', {name: 'Tracker list'}).selectOption('empty');
    await expect(panel).toHaveCount(0);
    await quick.press('Enter');
    await panel.getByRole('button', {name: 'Refresh'}).press('Enter');
    await expect(page.getByText('There are no available trackers in this list.')).toBeVisible();
    await expect(panel).toHaveCount(0);
    await poster.getByRole('button', {name: 'Move', exact: true}).click();
    await poster.getByRole('button', {name: 'Move earlier'}).click();
    await expect(page.locator('.poster__title')).toHaveText(['Sintel', 'Big Buck Bunny']);
    await page.reload();
    await expect(page.locator('.poster__title')).toHaveText(['Sintel', 'Big Buck Bunny']);
  } finally {
    fast.resolve();
    slow.resolve();
    late.resolve();
    await devtools.detach();
  }
});

test('results keep columns, sources and filters usable through the layout transition', async ({
  extension: {context, worker, url},
}) => {
  await seedSearchSources(worker);
  await context.route(`${searchOrigin}/fast?**`, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: releaseMarkup('first', 'Sintel 1080p') + releaseMarkup('second', 'Sintel 720p'),
    }),
  );
  await context.route(`${searchOrigin}/slow?**`, (route) =>
    route.fulfill({contentType: 'text/html', body: '<main />'}),
  );
  const page = await context.newPage();
  await page.goto(`${url}/index.html#/search?query=Sintel`);
  const results = page.getByRole('table');
  const release = results.getByRole('link', {name: 'Sintel 1080p'});
  const alternate = results.getByRole('link', {name: 'Sintel 720p'});
  await expect(release).toBeVisible();
  const links = results.getByRole('link');
  await links.first().focus();
  await page.keyboard.press('Tab');
  await expect(links.nth(1)).toBeFocused();

  const source = page.getByRole('button', {name: sourceNames.fast, exact: true});
  const filter = page.getByRole('searchbox', {name: 'Filter by words'});
  for (const width of [600, 601, 640, 680, 681]) {
    await page.setViewportSize({width, height: 900});
    await expect(source).toBeInViewport();
    await expect(filter).toBeInViewport();
    await expect
      .poll(() =>
        results.evaluate((table) => {
          const container = table.parentElement!;
          return container.scrollWidth - container.clientWidth;
        }),
      )
      .toBe(0);
    const columns = results.getByRole('columnheader');
    await expect(columns).toHaveCount(6);
    for (const header of await columns.all()) await expect(header).toBeInViewport({ratio: 1});
    const sourceBox = (await source.boundingBox())!;
    const tableBox = (await results.boundingBox())!;
    if (width === 681) expect(sourceBox.x + sourceBox.width).toBeLessThan(tableBox.x);
    else expect(sourceBox.y + sourceBox.height).toBeLessThan(tableBox.y);
    await filter.fill('1080p');
    await expect(alternate).toHaveCount(0);
    await expect(release).toBeInViewport();
    await filter.clear();
    await expect(alternate).toBeVisible();
  }
});

for (const theme of ['light', 'dark']) {
  test(`search and settings fit the supported widths in ${theme} appearance`, async ({
    extension,
  }) => {
    const {context, worker, url} = extension;
    await seedSearchSources(worker);
    await context.route(`${searchOrigin}/**`, (route) =>
      route.fulfill({contentType: 'text/html', body: releaseMarkup('fixture', 'Sintel 1080p')}),
    );
    const page = await context.newPage();
    for (const width of [1280, 480, 320]) {
      await page.setViewportSize({width, height: 900});
      await page.goto(`${url}/index.html#/search?query=Sintel&theme=${theme}`);
      await expect(page.getByRole('link', {name: 'Sintel 1080p'})).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const field = page.getByRole('combobox', {name: 'Search'});
      await field.focus();
      await expect(field).toHaveCSS('outline-style', 'none');
      const navigation = await page.getByRole('link', {name: 'Options', exact: true}).boundingBox();
      const searchField = await field.boundingBox();
      expect(navigation).not.toBeNull();
      expect(searchField).not.toBeNull();
      expect(navigation!.y + navigation!.height / 2).toBeCloseTo(
        searchField!.y + searchField!.height / 2,
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await page.goto(`${url}/index.html#/options/quality?theme=${theme}`);
      await expect(page.getByRole('heading', {name: 'Scoring rules'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Save', exact: true})).toBeDisabled();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await page.goto(`${url}/index.html#/options/profiles/films?theme=${theme}`);
      await expect(page.getByRole('checkbox', {name: 'Requests via site tab'})).toHaveCount(2);
      await expect(page.getByRole('link', {name: 'Open tracker builder'})).toBeVisible();
      await expect(page.getByRole('link', {name: 'Add tracker', exact: true})).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
  });
}

test('Kinopoisk renders movies and series from its current lists', async ({extension}) => {
  const {context, worker, url} = extension;
  await seedExplorer(worker, ['kpInCinema', 'kpSeries', 'kpPopular']);
  const card = (href: string, title: string, details: string, original = '') => `
    <div data-test-id="movie-list-item">
      <a aria-hidden="true" href="${href}"><img src="${mockPoster}"></a>
      <a data-test-id="next-link" href="${href}">
        <div><span class="styles_mainTitle__fixture">${title}</span><span>Промо</span></div>
        <div>
          <span class="desktop-list-main-info_secondaryTitle__fixture">${original}</span>
          <span class="desktop-list-main-info_secondaryText__fixture">${details}</span>
        </div>
      </a>
    </div>`;
  const first = card('/film/101/', 'Cinema fixture', ', 2025, 92 min', 'Cinema original');
  await context.route('https://www.kinopoisk.ru/lists/movies/**', (route) => {
    const request = new URL(route.request().url());
    const body = request.searchParams.has('b')
      ? card('/series/201/', 'Series fixture', '2018–2020')
      : request.searchParams.get('page') === '2'
        ? first + card('/film/102/', 'Another cinema fixture', '90 min')
        : first + '<a href="/lists/movies/movies-in-cinema/?page=2">2</a>';
    return route.fulfill({contentType: 'text/html; charset=utf-8', body});
  });
  await context.route('https://www.kinopoisk.ru/popular/day/now/perpage/200/', (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: '<div class="stat"><div class="el"><b><a href="/film/301/popular/.">1</a></b><a href="/film/301/">Popular fixture (2024)</a><i>Original</i></div></div>',
    }),
  );
  const page = await context.newPage();
  await page.goto(`${url}/index.html`);
  const cinema = page.locator('[data-id="kpInCinema"]');
  await expect(cinema.locator('.poster__title')).toHaveText([
    'Cinema fixture 2025',
    'Another cinema fixture',
  ]);
  await expect(cinema.locator('.image__image').first()).toHaveAttribute('src', mockPoster);
  await expect(cinema.locator('.image__more_link').first()).toHaveAttribute(
    'href',
    'https://www.kinopoisk.ru/film/101/',
  );
  await expect(page.locator('[data-id="kpSeries"] .poster__title')).toHaveText(
    'Series fixture 2018',
  );
  await expect(page.locator('[data-id="kpPopular"] .poster__title')).toHaveText(
    'Popular fixture 2024',
  );
});

test('Kinopoisk favorites recognize sign-out and load with the site session', async ({
  extension,
}) => {
  const {context, worker, url} = extension;
  await seedExplorer(worker, ['kpFavorites']);
  await context.route('https://www.kinopoisk.ru/images/film_iphone/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="540"/>',
    }),
  );
  await context.route('https://www.kinopoisk.ru/mykp/folders/6/**', async (route) => {
    const {cookie} = await route.request().allHeaders();
    if (!cookie?.includes('kp-fixture=active')) {
      return route.fulfill({status: 401});
    }
    const card = (path: string, title: string) =>
      `<li class="item"><div class="poster"><img src="/images/spacer.gif" title="${mockPoster}"></div><div class="info"><a class="name" href="${path}">${title}</a><span>(2025)</span></div></li>`;
    const page = new URL(route.request().url()).searchParams.get('page');
    const first = card('/film/301/', 'Private fixture');
    const rows =
      page === '2'
        ? first + card('/series/302/?ref=folder', 'Next page fixture')
        : !page
          ? first
          : '';
    return route.fulfill({contentType: 'text/html', body: `<ul id="itemList">${rows}</ul>`});
  });
  await context.route(
    (request) => request.origin === 'https://www.kinopoisk.ru' && request.pathname === '/',
    (route) =>
      route.fulfill({
        headers: new URL(route.request().url()).searchParams.has('fixture')
          ? {'set-cookie': 'kp-fixture=active; Path=/; HttpOnly; Secure; SameSite=None'}
          : {},
        contentType: 'text/html',
        body: '<button>Sign in</button>',
      }),
  );
  const page = await context.newPage();
  await page.goto(`${url}/index.html`);
  const favorites = page.locator('[data-id="kpFavorites"]');
  const refresh = favorites.getByRole('button', {name: 'Refresh collection'});
  await favorites.getByRole('button', {name: 'Customize'}).click();
  await refresh.click();
  await expect(favorites.getByRole('status')).toHaveText('Sign in');
  const site = await context.newPage();
  await site.goto('https://www.kinopoisk.ru/?fixture=login');
  await expect
    .poll(async () =>
      (await context.cookies('https://www.kinopoisk.ru')).some(
        ({name, value}) => name === 'kp-fixture' && value === 'active',
      ),
    )
    .toBe(true);
  await refresh.click();
  await expect(refresh).toBeFocused();
  await expect(favorites.locator('.poster__title')).toHaveText([
    'Private fixture 2025',
    'Next page fixture 2025',
  ]);
  const posters = favorites.locator('.image__image');
  for (const [index, id] of [301, 302].entries()) {
    await expect(posters.nth(index)).toHaveAttribute(
      'src',
      `https://www.kinopoisk.ru/images/film_iphone/iphone360_${id}.jpg`,
    );
  }
});

test('IMDb keeps cached cards during a failed refresh and replaces them after retry', async ({
  extension,
}) => {
  const {context, worker, url} = extension;
  const firstRequest = Promise.withResolvers<void>();
  let unavailable = true;
  const charts = [
    ['imdbPopular', 'moviemeter', '101', 'Movie fixture', 'Releases Nov 19, 2026'],
    ['imdbSeries', 'tvmeter', '201', 'TV fixture', '2022– '],
    ['imdbInCinema', 'boxoffice', '301', 'Box office fixture', ''],
  ] as const;
  await seedExplorer(
    worker,
    charts.map(([id]) => id),
  );
  await worker.evaluate(() =>
    chrome.storage.local.set({
      explorerCache: {
        imdbPopular: {
          createdAt: Math.floor(Date.now() / 1000),
          value: [{title: 'Outdated result', url: 'https://www.imdb.com/title/tt9/'}],
        },
      },
    }),
  );
  for (const [, chart, id, title, details] of charts) {
    await context.route(`https://www.imdb.com/chart/${chart}/`, async (route) => {
      if (chart === 'moviemeter' && unavailable) {
        await firstRequest.promise;
        return route.fulfill({status: 503});
      }
      return route.fulfill({
        contentType: 'text/html',
        body: `<ul>
          <li class="ipc-metadata-list-summary-item">
            <div class="ipc-poster"><img src="${mockPoster}" alt="${title} (2025)"></div>
            <a class="ipc-title-link-wrapper" href="/title/tt${id}/?ref_=chart"><h4 class="ipc-title__text">${title}</h4></a>
            <div class="cli-title-metadata"><ul><li>${details}</li></ul></div>
          </li>
        </ul>`,
      });
    });
  }
  const page = await context.newPage();
  try {
    await page.goto(`${url}/index.html`);
    const popular = page.locator('[data-id="imdbPopular"]');
    const cards = popular.locator('.poster__title');
    const category = popular.locator('.section__head').getByRole('button', {expanded: true});
    const errorText = 'Could not refresh this collection. Try again.';
    const error = popular.locator('.section__head').getByTitle(errorText, {exact: true});
    await expect(cards).toHaveText('Outdated result');
    firstRequest.resolve();
    await expect(error).toBeVisible();
    await expect(category).toHaveAccessibleDescription(errorText);
    await expect(cards).toHaveText('Outdated result');

    unavailable = false;
    await popular.getByRole('button', {name: 'Customize'}).click();
    await popular.getByRole('button', {name: 'Refresh collection'}).click();
    await expect(error).toHaveCount(0);
  } finally {
    firstRequest.resolve();
  }
  for (const [[sectionId, , id, title], year] of charts.map(
    (chart, index) => [chart, ['2026', '2022', '2025'][index]] as const,
  )) {
    const section = page.locator(`[data-id="${sectionId}"]`);
    await expect(section.locator('.poster__title')).toHaveText(`${title} ${year}`);
    await expect(section.locator('.image__more_link')).toHaveAttribute(
      'href',
      `https://www.imdb.com/title/tt${id}/`,
    );
  }
});

test('TMDB starts disabled and loads paginated collections from a site tab when enabled', async ({
  extension,
}) => {
  const {context, worker, url} = extension;
  await seedExplorer(worker, ['favorites', 'ggGamesTop']);
  await context.route('https://gameguru.ru/games/platform_pc/**', (route) => {
    const game = (slug: string, title: string) =>
      `<div class="short-news"><div class="short-news-title"><a href="/game/${slug}/">${title}</a></div></div>`;
    const first = game('first', 'Popular PC game');
    const body =
      new URL(route.request().url()).searchParams.get('page') === '2'
        ? first + game('second', 'Another PC game')
        : first + '<a class="show-more" href="/games/platform_pc/?page=2">More</a>';
    return route.fulfill({
      contentType: 'text/html',
      body: `<div id="publications-wrap">${body}</div>`,
    });
  });
  const tmdb = (kind: string, id: string, title: string, details: string) => `
    <div>
      <a href="/${kind}/${id}-fixture"><img class="poster" src="${mockPoster}"></a>
      <div>
        <a data-id="${id}" data-media-type="${kind}" href="/${kind}/${id}-fixture"><h2>${title}</h2></a>
        <span class="release_date">${details}</span>
      </div>
    </div>`;
  await context.route('https://www.themoviedb.org/**', (route) => {
    const request = new URL(route.request().url());
    if (request.pathname === '/') {
      return route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>TMDB fixture homepage</title>',
      });
    }
    if (
      !route
        .request()
        .frame()
        .url()
        .startsWith(request.origin + '/')
    ) {
      return route.fulfill({status: 403});
    }
    const body =
      request.pathname === '/tv'
        ? tmdb('tv', '501', 'TMDB TV fixture', '14 September 2023')
        : request.pathname === '/movie/now-playing'
          ? tmdb('movie', '502', 'TMDB cinema fixture', '12 Oct 2025')
          : request.searchParams.get('page') === '2'
            ? tmdb('movie', '503', 'TMDB movie fixture', '20 April 2024') +
              tmdb('movie', '504', 'TMDB second page fixture', '')
            : tmdb('movie', '503', 'TMDB movie fixture', '20 April 2024') +
              '<a class="load_more" href="?page=2">Load more</a>';
    return route.fulfill({contentType: 'text/html', body});
  });
  const page = await context.newPage();
  await page.goto(`${url}/index.html`);
  await expect(page.locator('.section__title')).toHaveText(['Games: Popular on PC']);
  const enableSection = (id: string) =>
    worker.evaluate(async (id) => {
      const {options} = await chrome.storage.sync.get<{
        options: {explorerSections: Record<string, boolean>};
      }>({options: {explorerSections: {}}});
      options.explorerSections = {...options.explorerSections, [id]: true};
      await chrome.storage.sync.set({options});
    }, id);
  await enableSection('tmdbPopular');
  const games = page.locator('[data-id="ggGamesTop"]');
  await expect(games.locator('.poster__title')).toHaveText(['Popular PC game', 'Another PC game']);
  const movies = page.locator('[data-id="tmdbPopular"]');
  await expect(movies.locator('.poster__title')).toHaveText([
    'TMDB movie fixture 2024',
    'TMDB second page fixture',
  ]);
  await expect(movies.locator('.image__image').first()).toHaveAttribute('src', mockPoster);
  await enableSection('tmdbInCinema');
  await expect(page.locator('[data-id="tmdbInCinema"] .poster__title')).toHaveText(
    'TMDB cinema fixture 2025',
  );
  await enableSection('tmdbSeries');
  await expect(page.locator('[data-id="tmdbSeries"] .poster__title')).toHaveText(
    'TMDB TV fixture 2023',
  );
});

const magnet = 'magnet:?xt=urn:btih:0123456789012345678901234567890123456789';

interface CatalogueCase {
  id: string;
  file?: string;
  external?: string;
  origin: string;
  searchPath: string | RegExp;
  queryField: string;
  method?: 'POST';
  category?: string;
  section?: string;
  state?: 'login' | 'empty';
  rows: {
    title: string;
    href: string;
    sizeBytes: number;
    seeds: string;
    peers: string;
    date?: string;
    download?: string;
  }[];
}

const catalogueCases: CatalogueCase[] = [
  {
    id: 'rutracker',
    origin: 'https://rutracker.org',
    searchPath: '/forum/tracker.php',
    queryField: 'nm',
    method: 'POST',
    category: 'Other 1',
    section: 'Example channel',
    rows: [
      {
        title: 'Public Domain Series',
        href: '/forum/viewtopic.php?t=42',
        sizeBytes: 2 * 1024 ** 3,
        seeds: '17',
        peers: '4',
        date: 'Jan 1, 2022 12:00 AM',
        download: '/forum/dl.php?t=42',
      },
    ],
  },
  {
    id: 'rutracker',
    file: 'rutracker-login',
    origin: 'https://rutracker.org',
    searchPath: '/forum/tracker.php',
    queryField: 'nm',
    method: 'POST',
    state: 'login',
    rows: [],
  },
  {
    id: 'rutracker',
    file: 'rutracker-empty',
    origin: 'https://rutracker.org',
    searchPath: '/forum/tracker.php',
    queryField: 'nm',
    method: 'POST',
    state: 'empty',
    rows: [],
  },
  {
    id: 'rutor',
    origin: 'https://rutor.info',
    searchPath: /^\/search\//,
    queryField: 'path',
    rows: [
      {
        title: 'Open Film With Magnet',
        href: '/torrent/42',
        sizeBytes: 2 * 1024 ** 3,
        seeds: '18',
        peers: '5',
        date: 'Jan 1, 2022 12:00 AM',
        download: magnet,
      },
      {
        title: 'Open Film With Direct Download',
        href: '/torrent/43',
        sizeBytes: 3 * 1024 ** 3,
        seeds: '11',
        peers: '2',
        download: '/download/43',
      },
    ],
  },
  {
    id: '1337x',
    external: '1337x_to',
    origin: 'https://1337x.to',
    searchPath: /^\/search\//,
    queryField: 'path',
    rows: [
      {
        title: 'Open Film Archive',
        href: '/torrent/42/open-film/',
        sizeBytes: 2 * 1024 ** 3,
        seeds: '2179',
        peers: '126',
        date: 'Jan 1, 2022 12:00 AM',
      },
    ],
  },
  {
    id: 'metal-tracker',
    external: 'metal-tracker_com',
    origin: 'https://www.metal-tracker.com',
    searchPath: '/torrents/search.html',
    queryField: 'SearchTorrentsForm[nameTorrent]',
    method: 'POST',
    rows: [
      {
        title: 'Open Music Collection',
        href: '/torrents/42.html',
        sizeBytes: 512 * 1024 ** 2,
        seeds: '10',
        peers: '4',
      },
    ],
  },
  {
    id: 'tokyo-toshokan',
    external: 'tokyotosho_info',
    origin: 'https://tokyo-tosho.net',
    searchPath: '/search.php',
    queryField: 'terms',
    rows: [
      {
        title: 'Public Domain Animation',
        href: magnet,
        sizeBytes: 512 * 1024 ** 2,
        seeds: '14',
        peers: '3',
        date: 'Jan 1, 2022 12:30 PM',
        download: '/files/example.torrent',
      },
    ],
  },
  {
    id: 'uniongang',
    external: 'uniongang_tv',
    origin: 'https://uniongang.org',
    searchPath: '/browse.php',
    queryField: 'search',
    rows: [
      {
        title: 'Public Domain Documentary',
        href: '/details.php?id=42',
        sizeBytes: 2 * 1024 ** 3,
        seeds: '13',
        peers: '5',
        date: 'Jan 1, 2022 12:00 AM',
      },
    ],
  },
  {
    id: 'torrentdownloads',
    external: 'torrentdownloads_me',
    origin: 'https://www.torrentdownloads.pro',
    searchPath: '/search/',
    queryField: 'search',
    rows: [
      {
        title: 'Public Domain Audio',
        href: '/torrent/42/open-audio',
        sizeBytes: 3 * 1024 ** 3,
        seeds: '23',
        peers: '6',
      },
    ],
  },
];

for (const fixture of catalogueCases) {
  test(`tracker catalogue handles ${fixture.file ?? fixture.id}`, async ({extension}) => {
    const {context, worker, url} = extension;
    const query = 'лёд & jazz';
    let html = await readFile(
      new URL(`./fixtures/trackers/${fixture.file ?? fixture.id}.html`, import.meta.url),
      'utf8',
    );
    const definition = fixture.external
      ? prepareTrackerDefinition(
          await readFile(
            new URL(`../../external/${fixture.external}.json`, import.meta.url),
            'utf8',
          ),
        )
      : null;
    await worker.evaluate(
      async ({id, definition}) => {
        await chrome.storage.local.set({
          profileId: 'catalogue-fixture',
          lastCheckUpdateAt: Math.floor(Date.now() / 1000),
          trackers: definition ? {[id]: {id, ...definition}} : {},
        });
        await chrome.storage.sync.set({
          options: {defineCategory: false},
          profiles: [
            {
              id: 'catalogue-fixture',
              name: 'Catalogue fixture',
              trackers: [{id, options: {enableProxy: false}}],
            },
          ],
        });
      },
      {id: fixture.id, definition},
    );

    const requests: {method: string; query: string | null}[] = [];
    const route = (url: URL) =>
      url.origin === fixture.origin &&
      (typeof fixture.searchPath === 'string'
        ? url.pathname === fixture.searchPath
        : fixture.searchPath.test(url.pathname));
    await context.route(/^https?:\/\//, (unmocked) => unmocked.abort());
    await context.route(route, async (intercepted) => {
      const request = intercepted.request();
      const url = new URL(request.url());
      const parameters =
        fixture.method === 'POST'
          ? new URLSearchParams(request.postData() ?? '')
          : url.searchParams;
      const term =
        fixture.queryField === 'path'
          ? (url.pathname
              .split('/')
              .map(decodeURIComponent)
              .find((part) => part === query) ?? null)
          : parameters.get(fixture.queryField);
      requests.push({method: request.method(), query: term});
      await intercepted.fulfill({body: html, contentType: 'text/html; charset=utf-8'});
    });

    const page = await context.newPage();
    const response = page.waitForResponse((response) => route(new URL(response.url())));
    await page.goto(`${url}/index.html#/search?query=${encodeURIComponent(query)}`);
    await response;
    expect(requests).toEqual([{method: fixture.method ?? 'GET', query}]);

    if (fixture.state === 'login') {
      const login = page.getByRole('button', {name: 'Sign in', exact: true});
      await login.press('Enter');
      const loginLink = page.getByRole('link', {name: 'Sign in', exact: true});
      await expect(loginLink).toHaveAttribute('href', `${fixture.origin}/forum/login.php`);
      await page.keyboard.press('Tab');
      await expect(loginLink).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(login).toBeFocused();
      await expect(loginLink).toHaveCount(0);
      await login.press('Enter');
      html = await readFile(new URL('./fixtures/trackers/rutracker.html', import.meta.url), 'utf8');
      await page.getByRole('button', {name: 'Retry search', exact: true}).press('Enter');
      await expect(
        page.getByRole('link', {name: 'Public Domain Series', exact: true}),
      ).toBeVisible();
      await expect(login).toHaveCount(0);
      expect(requests).toEqual([
        {method: 'POST', query},
        {method: 'POST', query},
      ]);
      return;
    } else {
      for (const expected of fixture.rows) {
        const title = page.getByRole('link', {name: expected.title, exact: true});
        await expect(title).toHaveAttribute('href', new URL(expected.href, fixture.origin).href);
        const row = page.locator('.body__row').filter({has: title});
        const size = filesize(expected.sizeBytes);
        await expect(row.locator('.cell-size')).toHaveText(expected.download ? size + ' ↓' : size);
        await expect(row.locator('.cell-seeds')).toHaveText(expected.seeds);
        await expect(row.locator('.cell-peers')).toHaveText(expected.peers);
        if (expected.date)
          await expect(row.locator('.cell-date')).toHaveAttribute('title', expected.date);
        if (expected.download) {
          await expect(row.locator('.cell-size').getByRole('link')).toHaveAttribute(
            'href',
            new URL(expected.download, fixture.origin).href,
          );
        }
      }
      await expect(page.locator('.tracker__icon-loading')).toHaveCount(0);
      await expect(page.locator('.tracker__counter')).toHaveText(String(fixture.rows.length));
      await expect(page.getByRole('button', {name: 'Sign in', exact: true})).toHaveCount(0);
      if (fixture.category)
        await expect(page.getByRole('button', {name: fixture.category, exact: true})).toBeVisible();
      if (fixture.section) {
        await expect(page.getByRole('link', {name: fixture.section, exact: true})).toBeVisible();
        await page.locator('input[name="textFilter"]').fill(fixture.section);
      }
    }
    await expect(page.locator('.body__row')).toHaveCount(fixture.rows.length);
  });
}
