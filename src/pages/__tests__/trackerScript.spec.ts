import {expect} from '@playwright/test';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import JSZip from 'jszip';
import {test as base} from './extensionTest';

const site = 'https://uniongang.org';
const scriptId = 'fixture-script';
const test = base.extend({
  extension: async ({extension}, use) => {
    await extension.worker.evaluate(async (id) => {
      await chrome.storage.local.set({profileId: 'fixture'});
      await chrome.storage.sync.set({
        profiles: [{id: 'fixture', name: 'Fixture', trackers: [{id}]}],
      });
    }, scriptId);
    await use(extension);
  },
});

const editorUrl = (app: string) => `${app}#/editor/tracker/${scriptId}`;
const scriptPath = new URL('../../../external/uniongang_tv.user.js', import.meta.url);

test('a locally enabled script paginates and restoring different code cannot enable it', async ({
  extension,
}) => {
  const {context, worker, app} = extension;
  const seen: number[] = [];
  await context.route(`${site}/**`, (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/') return route.fulfill({body: '<title>Fixture</title>'});
    expect(url.searchParams.get('search')).toBe('Cinema');
    const page = Number(url.searchParams.get('page') ?? 1);
    seen.push(page);
    return route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body:
        `<ul data-href="browse.php?search=Cinema&amp;page={{number}}" data-startpage="${page}" data-totalpages="2"></ul>` +
        '<table class="brws main"><tr><td><table><tr><td>' +
        `<a href="details.php?id=${page}">Fixture ${page}</a></td></tr></table></td>` +
        '<td>2 GB</td><td>13 | 5</td><td>Author</td><td>2022-01-01</td></tr></table>',
    });
  });
  const editor = await context.newPage();
  await editor.goto(editorUrl(app));
  await editor.getByLabel('Import file').setInputFiles({
    name: 'uniongang.user.js',
    mimeType: 'text/javascript',
    buffer: await readFile(scriptPath),
  });
  const save = editor.getByRole('button', {name: 'Save*', exact: true});
  const confirmation = editor.getByRole('dialog', {name: 'Enable script'});
  await save.click();
  await expect(confirmation).toContainText(site);
  await confirmation.getByRole('button', {name: 'Cancel'}).click();
  expect(
    await worker.evaluate(async (id) => {
      const {trackers} = await chrome.storage.local.get<{trackers: Record<string, unknown>}>({
        trackers: {},
      });
      return Object.hasOwn(trackers, id);
    }, scriptId),
  ).toBe(false);
  await save.click();
  await confirmation.getByRole('button', {name: 'Enable script'}).click();
  await expect(editor.getByRole('button', {name: 'Save', exact: true})).toBeVisible();
  await editor.reload();
  await expect(editor.getByRole('textbox', {name: 'Tracker code'})).toContainText('UnionGang');

  const search = await context.newPage();
  await search.goto(`${app}#/search?query=Cinema`);
  await expect(search.getByRole('link', {name: 'Fixture 1'})).toBeVisible();
  const more = search.getByRole('button', {name: 'Load more'});
  await more.click();
  await expect(search.getByRole('link', {name: 'Fixture 2'})).toBeVisible();
  await expect(more).toHaveCount(0);
  expect(seen).toEqual([1, 2]);

  const stored = await worker.evaluate(async () => {
    const {trackers} = await chrome.storage.local.get<{trackers: Record<string, {code: string}>}>({
      trackers: {},
    });
    return trackers;
  });
  stored[scriptId].code += '\n// different code from backup';
  const forged = createHash('sha256').update(JSON.stringify(stored[scriptId].code)).digest('hex');
  const zip = new JSZip();
  zip.file('local/trackers.json', JSON.stringify(stored));
  zip.file('local/trackerScriptApprovals.json', JSON.stringify({[scriptId]: forged}));
  const backup = await context.newPage();
  await backup.goto(`${app}#/options/backup`);
  const chooser = backup.waitForEvent('filechooser');
  await backup.getByRole('button', {name: /import.*zip/i}).click();
  await (
    await chooser
  ).setFiles({
    name: 'backup.zip',
    mimeType: 'application/zip',
    buffer: await zip.generateAsync({type: 'nodebuffer'}),
  });
  await backup
    .getByRole('dialog', {name: 'Review backup'})
    .getByRole('button', {name: 'Restore data'})
    .click();
  await expect(backup.getByText('Data restored.')).toBeVisible();
  await search.reload();
  await expect(search.getByRole('button', {name: 'Tracker error'})).toBeVisible();
  expect(seen).toEqual([1, 2]);
});

test('POST pagination keeps distinct request bodies at the same URL and stops on a repeat', async ({
  extension,
}) => {
  const {context, app} = extension;
  const requests: string[] = [];
  await context.route(`${site}/search`, (route) => {
    const request = route.request();
    const page = Number(new URLSearchParams(request.postData() ?? '').get('page'));
    requests.push(`${request.method()} ${page}`);
    return route.fulfill({
      json: {
        success: true,
        results: [{title: `Release ${page}`, url: `${site}/details.php?id=${page}`}],
        nextPageRequest: {
          url: `${site}/search`,
          method: 'POST',
          body: `page=${Math.min(page + 1, 3)}`,
        },
      },
    });
  });
  const editor = await context.newPage();
  await editor.goto(editorUrl(app));
  await editor.getByRole('textbox', {name: 'Tracker code'}).fill(`// ==UserScript==
// @name POST pagination fixture
// @version 1.0
// @trackerURL ${site}/
// @connect ${site}
// ==/UserScript==
const search = async (options) => (await API_request({...options, json: true})).body;
API_event('search', () => search({url: '${site}/search', method: 'POST', body: 'page=1'}));
API_event('getNextPage', search);`);
  await editor.getByRole('button', {name: 'Save*', exact: true}).click();
  await editor.getByRole('button', {name: 'Enable script', exact: true}).click();
  await expect(editor.getByRole('button', {name: 'Save', exact: true})).toBeVisible();

  const search = await context.newPage();
  await search.goto(`${app}#/search?query=Cinema`);
  await expect(search.getByRole('link', {name: 'Release 1'})).toBeVisible();
  const more = search.getByRole('button', {name: 'Load more'});
  await more.click();
  await expect(search.getByRole('link', {name: 'Release 2'})).toBeVisible();
  await more.click();
  await expect(search.getByRole('link', {name: 'Release 3'})).toBeVisible();
  await expect(more).toHaveCount(0);
  expect(requests).toEqual(['POST 1', 'POST 2', 'POST 3']);
});

test('a legacy script with an unsupported tracker API is rejected before saving', async ({
  extension,
}) => {
  const {context, worker, app} = extension;
  const page = await context.newPage();
  await page.goto(editorUrl(app));
  await page.getByRole('textbox', {name: 'Tracker code'}).fill(`// ==UserScript==
// @name Legacy fixture
// @version 1.0
// @trackerURL ${site}/
// @connect ${site}
// ==/UserScript==
API_exKit({version: 2, search: {url: '${site}/search'}, selectors: {row: {selector: 'article'}}});`);
  await page.getByRole('button', {name: 'Save*', exact: true}).click();
  await page.getByRole('button', {name: 'Enable script', exact: true}).click();
  await expect(page.getByRole('alert')).toContainText('Could not start this tracker script');
  expect(
    await worker.evaluate(async () => {
      const {trackers} = await chrome.storage.local.get<{trackers: Record<string, unknown>}>({
        trackers: {},
      });
      return Object.keys(trackers);
    }),
  ).toEqual([]);
});

test('the editor validates an approved script that requests data during initialization', async ({
  extension,
}) => {
  const {context, app} = extension;
  const requests: string[] = [];
  await context.route(`${site}/setup`, (route) => {
    requests.push(route.request().url());
    return route.fulfill({json: {title: 'Prepared result'}});
  });
  const editor = await context.newPage();
  await editor.goto(editorUrl(app));
  await editor.getByRole('textbox', {name: 'Tracker code'}).fill(`// ==UserScript==
// @name Initialization fixture
// @version 1.0
// @trackerURL ${site}/
// @connect ${site}
// ==/UserScript==
API_async(async () => {
  const {body} = await API_request({url: '${site}/setup', json: true});
  API_event('search', () => ({success: true, results: [{title: body.title, url: '${site}/details.php?id=1'}]}));
});`);
  await editor.getByRole('button', {name: 'Save*', exact: true}).click();
  const dialog = editor.getByRole('dialog', {name: 'Enable script'});
  await expect(dialog).toBeVisible();
  expect(requests).toEqual([]);
  await dialog.getByRole('button', {name: 'Enable script'}).click();
  await expect(editor.getByRole('button', {name: 'Save', exact: true})).toBeVisible();
  expect(requests).toEqual([`${site}/setup`]);

  const search = await context.newPage();
  await search.goto(`${app}#/search?query=Cinema`);
  await expect(search.getByRole('link', {name: 'Prepared result'})).toBeVisible();
  expect(requests).toEqual([`${site}/setup`, `${site}/setup`]);
});

for (const scenario of ['same-origin redirect', 'cross-origin redirect', 'cross-origin landing']) {
  test(`a tab keeps POST on the approved origin after a ${scenario}`, async ({extension}) => {
    const {context, app} = extension;
    const outgoing: string[] = [];
    const received: string[] = [];
    let foreignOrigin: string;
    const foreign = createServer((request, response) => {
      if (request.method === 'POST' || request.url === '/elsewhere') {
        outgoing.push(`${request.method} ${request.url}`);
      }
      response.end('<title>Other origin</title>');
    });
    const tracker = createServer((request, response) => {
      if (request.method === 'POST') received.push(request.url ?? '');
      if (request.url === '/post') {
        response.writeHead(307, {
          Location: scenario === 'cross-origin redirect' ? `${foreignOrigin}/elsewhere` : '/result',
        });
      }
      if (request.url === '/' && scenario === 'cross-origin landing') {
        response.writeHead(307, {Location: `${foreignOrigin}/elsewhere`});
      }
      response.end('Submitted on the approved origin');
    });
    try {
      const listen = async (server: typeof tracker) => {
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Fixture did not start');
        return `http://127.0.0.1:${address.port}`;
      };
      foreignOrigin = await listen(foreign);
      const origin = await listen(tracker);
      await context.unrouteAll();

      const editor = await context.newPage();
      await editor.goto(editorUrl(app));
      await editor.getByRole('textbox', {name: 'Tracker code'}).fill(`// ==UserScript==
// @name Tab POST fixture
// @version 1.0
// @trackerURL ${origin}/
// @connect ${origin}
// @requestMode tab
// ==/UserScript==
API_event('search', async () => {
  const result = await API_request({url: '${origin}/post', method: 'POST', body: 'private=value'})
    .then(({body}) => body, () => 'Blocked tab');
  return {success: true, results: [{title: result, url: '${origin}/details'}]};
});`);
      await editor.getByRole('button', {name: 'Save*', exact: true}).click();
      await editor.getByRole('button', {name: 'Enable script', exact: true}).click();
      await expect(editor.getByRole('button', {name: 'Save', exact: true})).toBeVisible();

      const search = await context.newPage();
      await search.goto(`${app}#/search?query=Cinema`);
      const allowed = scenario === 'same-origin redirect';
      const changedPort = scenario === 'cross-origin landing';
      const title = allowed ? 'Submitted on the approved origin' : 'Blocked tab';
      await expect(search.getByRole('link', {name: title})).toBeVisible();
      expect(received).toEqual(allowed ? ['/post', '/result'] : changedPort ? [] : ['/post']);
      expect(outgoing).toEqual(changedPort ? ['GET /elsewhere'] : []);
    } finally {
      await Promise.all(
        [tracker, foreign].map((server) => {
          server.closeAllConnections();
          return new Promise<void>((resolve) => server.close(() => resolve()));
        }),
      );
    }
  });
}

test('an approved direct request follows same-origin redirects and blocks other origins', async ({
  extension,
}) => {
  const {context, app} = extension;
  const foreign = 'https://denied.invalid';
  const editor = await context.newPage();
  await editor.goto(editorUrl(app));
  await editor.getByRole('textbox', {name: 'Tracker code'}).fill(`// ==UserScript==
// @name Redirect fixture
// @version 1.0
// @trackerURL ${site}/
// @connect ${site}
// @requestMode direct
// ==/UserScript==
API_event('search', async () => {
  const response = await API_request({url: '${site}/start', method: 'POST', body: 'q=Cinema'});
  let rejected = false;
  try { await API_request('${site}/escape'); } catch { rejected = true; }
  if (!rejected) throw new Error('Unexpected network access');
  return {success: true, results: [{title: response.body, url: response.url}]};
});`);
  await editor.getByRole('button', {name: 'Save*', exact: true}).click();
  await editor.getByRole('button', {name: 'Enable script', exact: true}).click();
  await expect(editor.getByRole('button', {name: 'Save', exact: true})).toBeVisible();

  // Intercept each redirect hop, which Playwright routes only expose for the first URL.
  await context.unrouteAll();
  const search = await context.newPage();
  const devtools = await context.newCDPSession(search);
  const requests: string[] = [];
  devtools.on('Fetch.requestPaused', async ({requestId, request}) => {
    requests.push(`${request.method} ${request.url}`);
    if (request.url === `${site}/start` || request.url === `${site}/escape`) {
      await devtools.send('Fetch.fulfillRequest', {
        requestId,
        responseCode: 303,
        responseHeaders: [
          {
            name: 'Location',
            value: request.url.endsWith('/start') ? '/result' : `${foreign}/result`,
          },
        ],
      });
    } else {
      await devtools.send('Fetch.fulfillRequest', {
        requestId,
        responseCode: 200,
        body: Buffer.from('Redirected result').toString('base64'),
      });
    }
  });
  await devtools.send('Fetch.enable', {
    patterns: [{urlPattern: `${site}/*`}, {urlPattern: `${foreign}/*`}],
  });
  await search.goto(`${app}#/search?query=Cinema`);
  await expect(search.getByRole('link', {name: 'Redirected result'})).toHaveAttribute(
    'href',
    `${site}/result`,
  );
  expect(requests).toEqual([`POST ${site}/start`, `GET ${site}/result`, `GET ${site}/escape`]);
});

test('an approved script cannot request or navigate to a different origin', async ({extension}) => {
  const {context, app} = extension;
  const requests: string[] = [];
  const foreign = 'https://denied.invalid';
  await context.route(`${foreign}/**`, (route) => {
    requests.push(new URL(route.request().url()).pathname);
    return route.fulfill({
      body: 'Unexpected access',
      headers: {'Access-Control-Allow-Origin': '*'},
    });
  });
  await context.route(`${site}/redirect`, (route) =>
    route.fulfill({status: 302, headers: {Location: `${foreign}/redirected`}}),
  );
  await context.route(`${site}/`, (route) => route.fulfill({body: '<title>Fixture</title>'}));

  const code = `// ==UserScript==
// @name Network fixture
// @version 1.0
// @trackerURL ${site}/
// @connect *
// @requestMode tab
// ==/UserScript==
API_event('search', async () => {
  if (typeof globalThis.chrome?.storage !== 'undefined') throw new Error('Unexpected extension APIs');
  const blocked = (promise) => promise.then(() => false, () => true);
  const checks = await Promise.all([
    blocked(fetch('${foreign}/direct')),
    blocked(API_request('${foreign}/broker')),
    blocked(API_request('${site}/redirect')),
  ]);
  if (checks.some((value) => !value)) throw new Error('Unexpected network access');
  location.href = '${foreign}/navigation';
  return {success: true, results: [{title: 'Blocked', url: '${site}/details.php?id=1'}]};
});`;
  const editor = await context.newPage();
  await editor.goto(editorUrl(app));
  await editor.getByRole('textbox', {name: 'Tracker code'}).fill(code);
  await editor.getByRole('button', {name: 'Save*', exact: true}).click();
  await editor.getByRole('button', {name: 'Enable script', exact: true}).click();
  await expect(editor.getByRole('button', {name: 'Save', exact: true})).toBeVisible();

  const search = await context.newPage();
  const messages: string[] = [];
  search.on('console', (message) => messages.push(message.text()));
  await search.goto(`${app}#/search?query=Cinema`);
  await expect(search.getByRole('link', {name: 'Blocked', exact: true})).toBeVisible();
  await expect
    .poll(() =>
      messages.some((message) => message.includes('frame-src') && message.includes(foreign)),
    )
    .toBe(true);
  expect(requests).toEqual([]);
});
