import {createServer} from 'node:http';

import {expect} from '@playwright/test';
import JSZip from 'jszip';

import {prepareTrackerDefinition} from '../../tools/trackerDefinition';

import {test} from './extensionTest';

test('saving a profile preserves the unsaved order of the profile list', async ({extension}) => {
  const {context, worker, app} = extension;
  await worker.evaluate(() =>
    chrome.storage.sync.set({
      profiles: [
        {id: 'first', name: 'First', trackers: []},
        {id: 'second', name: 'Second', trackers: []},
      ],
    }),
  );
  const page = await context.newPage();
  await page.goto(`${app}#/options/profiles`);
  const names = page.locator('.manager__profiles .item__name');
  await page.getByRole('button', {name: 'Move earlier: Second'}).click();
  await expect(names).toHaveText(['Second', 'First']);
  await page.getByRole('link', {name: 'First', exact: true}).click();
  await page.getByRole('textbox', {name: 'List name'}).fill('Edited first');
  const save = page.getByRole('button', {name: 'Save', exact: true});
  await save.click();
  await expect(save).toBeDisabled();
  await page.getByRole('link', {name: 'Cancel', exact: true}).click();
  await expect(names).toHaveText(['Second', 'Edited first']);
  await expect(save).toBeEnabled();
  await save.click();
  await expect(save).toBeDisabled();
  await page.reload();
  await expect(names).toHaveText(['Second', 'Edited first']);
});

test('saving a profile name does not hide a conflicting reorder from another tab', async ({
  extension: {context, worker, app},
}) => {
  const profiles = ['First', 'Second', 'Third'].map((name) => ({
    id: name.toLowerCase(),
    name,
    trackers: [],
  }));
  await worker.evaluate((profiles) => chrome.storage.sync.set({profiles}), profiles);
  const page = await context.newPage();
  await page.goto(app + '#/options/profiles');
  await page.getByRole('button', {name: 'Move earlier: Second'}).click();
  await page.getByRole('link', {name: 'First', exact: true}).click();
  await page.getByRole('textbox', {name: 'List name'}).fill('Edited first');
  await worker.evaluate(
    (profiles) => chrome.storage.sync.set({profiles}),
    [profiles[0], profiles[2], profiles[1]],
  );
  const save = page.getByRole('button', {name: 'Save', exact: true});
  await save.click();
  await expect(save).toBeDisabled();
  await page.getByRole('link', {name: 'Cancel', exact: true}).click();
  await save.click();
  await expect(page.getByRole('button', {name: 'Refresh', exact: true})).toBeVisible();
  const stored = await worker.evaluate(
    async () => (await chrome.storage.sync.get('profiles')).profiles,
  );
  expect(stored).toEqual([{...profiles[0], name: 'Edited first'}, profiles[2], profiles[1]]);
});

test('saving another list does not rebase a pending profile draft over a conflicting edit', async ({
  extension: {context, worker, app},
}) => {
  const first = {id: 'first', name: 'First', trackers: []};
  const second = {id: 'second', name: 'Second', trackers: []};
  const write = (profiles: (typeof first)[]) =>
    worker.evaluate((profiles) => chrome.storage.sync.set({profiles}), profiles);
  await write([first, second]);
  const page = await context.newPage();
  await page.goto(app + '#/options/profiles');
  await page.getByRole('link', {name: 'Second', exact: true}).click();
  const name = page.getByRole('textbox', {name: 'List name'});
  await name.fill('Draft second');
  await page.goBack();
  await expect(page.getByRole('link', {name: 'Draft second'})).toBeVisible();
  await write([first, {...second, name: 'Second from the other tab'}]);
  await page.getByRole('link', {name: 'First', exact: true}).click();
  await name.fill('Edited first');
  const save = page.getByRole('button', {name: 'Save', exact: true});
  await save.click();
  await expect(save).toBeDisabled();
  await page.getByRole('link', {name: 'Cancel', exact: true}).click();
  await page.getByRole('link', {name: 'Draft second'}).click();
  await save.click();
  await expect(page.getByRole('button', {name: 'Refresh', exact: true})).toBeVisible();
  const stored = await worker.evaluate(
    async () => (await chrome.storage.sync.get('profiles')).profiles,
  );
  expect(stored).toEqual([
    {...first, name: 'Edited first'},
    {...second, name: 'Second from the other tab'},
  ]);
});

test('catalog updates fetch the latest definition and keep the installed tracker identity', async ({
  extension,
}) => {
  const {context, worker, app} = extension;
  const origin = 'https://catalog.example.test';
  const source = `${origin}/files`;
  const download = `${origin}/tracker.json`;
  const definition = (version: string) => ({
    version: 3,
    type: 'kit',
    description: {name: 'Catalog fixture', version},
    search: {url: 'https://tracker.example.test/search?q=%search%'},
    selectors: {row: {selector: 'article'}},
  });
  const record = prepareTrackerDefinition(JSON.stringify(definition('1.0')), download);
  await worker.evaluate(
    async ({source, record}) => {
      await chrome.storage.sync.set({
        options: {repositories: [source]},
        profiles: [{id: 'catalog', name: 'Catalog', trackers: [{id: 'custom-id'}]}],
      });
      await chrome.storage.local.set({
        trackers: {
          'custom-id': {
            id: 'custom-id',
            ...record,
            options: {autoUpdate: false, lastUpdate: 12},
          },
        },
      });
    },
    {source, record},
  );
  let version = '1.0';
  await context.route(source, (route) =>
    route.fulfill({
      json: [{type: 'file', name: 'Tracker.json', html_url: download, download_url: download}],
    }),
  );
  await context.route(download, (route) => route.fulfill({json: definition(version)}));
  const page = await context.newPage();
  await page.goto(`${app}#/options/profiles/catalog`);
  await page.getByRole('button', {name: 'External', exact: true}).click();
  await page.getByRole('button', {name: /metadata/i}).click();
  const row = page.locator('.tracker-editor-row').filter({hasText: 'Catalog fixture'});
  await expect(row.getByRole('button', {name: 'Update', exact: true})).toBeVisible();
  version = '2.0';
  await row.getByRole('button', {name: 'Update', exact: true}).click();
  const installed = () =>
    worker.evaluate(async () => {
      const {trackers} = await chrome.storage.local.get<{trackers: Record<string, unknown>}>(
        'trackers',
      );
      return trackers;
    });
  await expect.poll(installed).toMatchObject({
    'custom-id': {
      meta: {version: '2.0'},
      options: {autoUpdate: false, lastUpdate: 12},
    },
  });
  expect(Object.keys(await installed())).toEqual(['custom-id']);
  version = '1.0';
  await row.getByRole('button', {name: 'Update', exact: true}).click();
  await expect(row.getByRole('alert')).toBeVisible();
  expect(await installed()).toMatchObject({'custom-id': {meta: {version: '2.0'}}});
});

test('a delayed background update preserves a tracker edited after the request started', async ({
  extension: {context, worker, app},
}) => {
  const requested = Promise.withResolvers<void>();
  const respond = Promise.withResolvers<void>();
  const definition = (name: string, version: string) =>
    JSON.stringify({
      version: 3,
      type: 'kit',
      description: {name, version},
      search: {url: 'https://tracker.example.test/search?q=%search%'},
      selectors: {row: {selector: 'article'}},
    });
  const server = createServer(async (_request, response) => {
    requested.resolve();
    await respond.promise;
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(definition('Remote update', '2.0'));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Fixture did not start');
    const source = `http://127.0.0.1:${address.port}/tracker.json`;
    await context.route(source, (route) => route.continue());
    const write = (code: string) =>
      worker.evaluate(
        (record) => chrome.storage.local.set({trackers: {custom: {id: 'custom', ...record}}}),
        prepareTrackerDefinition(code, source),
      );
    await write(definition('Installed tracker', '1.0'));

    const page = await context.newPage();
    await page.goto(app + '#/options/main');
    const update = page.evaluate(() =>
      chrome.runtime.sendMessage({action: 'updateTracker', id: 'custom'}),
    );
    await Promise.race([
      requested.promise,
      update.then(() => {
        throw new Error('The update ended before requesting the tracker');
      }),
    ]);
    await write(definition('Locally edited tracker', '1.0'));
    respond.resolve();
    await update;

    const {trackers} = await worker.evaluate(() => chrome.storage.local.get('trackers'));
    expect(trackers).toMatchObject({
      custom: {meta: {name: 'Locally edited tracker', version: '1.0'}},
    });
  } finally {
    respond.resolve();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('a saved HTTP JSON tracker paginates using its HTTPS redirect URL', async ({extension}) => {
  const {context, worker, app} = extension;
  const origin = 'http://redirect.example.test';
  const secure = 'https://redirect.example.test';
  const record = prepareTrackerDefinition(
    JSON.stringify({
      version: 3,
      type: 'kit',
      description: {name: 'Redirect fixture'},
      search: {url: `${origin}/search?q=%search%`},
      selectors: {
        row: {selector: 'article'},
        title: {selector: 'a', pipeline: [{name: 'getText'}]},
        url: {selector: 'a', pipeline: [{name: 'getProp', args: ['href']}]},
        nextPageUrl: {selector: 'a[rel=next]', pipeline: [{name: 'getProp', args: ['href']}]},
      },
    }),
  );
  // Reproduce records installed before HTTP upgrades were included in connection metadata.
  record.meta.connect = [origin];
  await worker.evaluate(async (record) => {
    await chrome.storage.local.set({trackers: {fixture: {id: 'fixture', ...record}}});
    await chrome.storage.sync.set({
      profiles: [{id: 'fixture', name: 'Fixture', trackers: [{id: 'fixture'}]}],
    });
  }, record);
  await context.unrouteAll();
  const page = await context.newPage();
  const devtools = await context.newCDPSession(page);
  const requests: string[] = [];
  devtools.on('Fetch.requestPaused', async ({requestId, request}) => {
    requests.push(request.url);
    if (request.url.startsWith(origin)) {
      await devtools.send('Fetch.fulfillRequest', {
        requestId,
        responseCode: 302,
        responseHeaders: [{name: 'Location', value: request.url.replace(origin, secure)}],
      });
    } else {
      const second = request.url.endsWith('/next');
      const body =
        `<article><a href="/item/${second ? 2 : 1}">Result ${second ? 2 : 1}</a></article>` +
        (second ? '' : '<a href="/next" rel="next">Next</a>');
      await devtools.send('Fetch.fulfillRequest', {
        requestId,
        responseCode: 200,
        responseHeaders: [{name: 'Content-Type', value: 'text/html; charset=utf-8'}],
        body: Buffer.from(body).toString('base64'),
      });
    }
  });
  await devtools.send('Fetch.enable', {
    patterns: [{urlPattern: `${origin}/*`}, {urlPattern: `${secure}/*`}],
  });
  await page.goto(`${app}#/search?query=film`);
  await expect(page.getByRole('link', {name: 'Result 1'})).toHaveAttribute(
    'href',
    `${secure}/item/1`,
  );
  await page.getByRole('button', {name: 'Load more'}).click();
  await expect(page.getByRole('link', {name: 'Result 2'})).toHaveAttribute(
    'href',
    `${secure}/item/2`,
  );
  await expect(page.getByRole('button', {name: 'Load more'})).toHaveCount(0);
  expect(requests).toEqual([
    `${origin}/search?q=film`,
    `${secure}/search?q=film`,
    `${secure}/next`,
  ]);
});

test('a saved default list omits retired trackers', async ({extension}) => {
  const {context, worker, app} = extension;
  await worker.evaluate(() =>
    chrome.storage.sync.set({
      profiles: [
        {
          id: 'default',
          name: 'Default',
          trackers: [{id: 'booktracker'}, {id: 'tfile'}, {id: 'opentorrent'}],
        },
      ],
    }),
  );
  const page = await context.newPage();
  await page.goto(`${app}#/`);
  await expect(page.getByRole('button', {name: 'Книжный трекер'})).toBeVisible();
  await expect(page.getByText('Not found', {exact: true})).toHaveCount(0);
});

test('switching tracker lists only changes the search in that tab', async ({extension}) => {
  const {context, worker, app} = extension;
  await context.route('https://booktracker.org/tracker.php?**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body:
        '<table id="tor-tbl"><tbody><tr><td></td><td></td><td></td>' +
        '<td class="row4 med tLeft"><a href="/viewtopic.php?t=42">Book result</a></td>' +
        '</tr></tbody></table>',
    }),
  );
  await worker.evaluate(async () => {
    await chrome.storage.local.set({
      profileId: 'books',
    });
    await chrome.storage.sync.set({
      profiles: [
        {id: 'books', name: 'Books', trackers: [{id: 'booktracker'}]},
        {id: 'empty', name: 'Empty', trackers: []},
      ],
    });
  });
  const first = await context.newPage();
  const second = await context.newPage();
  const search = `${app}#/search?query=book`;
  await Promise.all([first.goto(search), second.goto(search)]);
  await expect(first.getByRole('link', {name: 'Book result'})).toBeVisible();
  await expect(second.getByRole('link', {name: 'Book result'})).toBeVisible();
  await second.getByRole('combobox', {name: 'Tracker list'}).selectOption('empty');
  await expect(second.getByText('There are no available trackers in this list.')).toBeVisible();
  await expect
    .poll(() =>
      worker.evaluate(async () => (await chrome.storage.local.get('profileId')).profileId),
    )
    .toBe('empty');
  await expect(first.getByRole('link', {name: 'Book result'})).toBeVisible();
  await first.reload();
  await expect(first.getByRole('link', {name: 'Book result'})).toBeVisible();
  await expect(first.getByRole('combobox', {name: 'Tracker list'})).toHaveValue('books');
  const fresh = await context.newPage();
  await fresh.goto(search);
  await expect(fresh.getByRole('combobox', {name: 'Tracker list'})).toHaveValue('empty');
});

test('restoring the active tracker list applies to the importing tab and new tabs', async ({
  extension: {context, worker, app},
}) => {
  await worker.evaluate(async () => {
    await chrome.storage.sync.set({
      profiles: [
        {id: 'films', name: 'Films', trackers: []},
        {id: 'books', name: 'Books', trackers: []},
      ],
    });
    await chrome.storage.local.set({profileId: 'films'});
  });
  const importing = await context.newPage();
  const other = await context.newPage();
  const selector = {name: 'Tracker list'};
  await Promise.all([importing.goto(app), other.goto(app)]);
  await expect(importing.getByRole('combobox', selector)).toHaveValue('films');
  await expect(other.getByRole('combobox', selector)).toHaveValue('films');

  const zip = new JSZip();
  zip.file('local/profileId.json', JSON.stringify('books'));
  const buffer = await zip.generateAsync({type: 'nodebuffer'});
  await importing.getByRole('link', {name: 'Options', exact: true}).click();
  await importing.getByRole('link', {name: /^Backup\b/}).click();
  await importing
    .getByLabel(/import.*zip/i)
    .setInputFiles({name: 'backup.zip', mimeType: 'application/zip', buffer});
  await importing
    .getByRole('dialog', {name: 'Review backup'})
    .getByRole('button', {name: 'Restore data'})
    .click();
  await expect(importing.getByRole('status').filter({hasText: /restored\.$/})).toBeVisible();
  await importing.getByRole('banner').getByRole('navigation').locator('a[href="#/"]').click();
  await expect(importing.getByRole('combobox', selector)).toHaveValue('books');
  await importing.reload();
  await expect(importing.getByRole('combobox', selector)).toHaveValue('books');
  await other.reload();
  await expect(other.getByRole('combobox', selector)).toHaveValue('films');
  const fresh = await context.newPage();
  await fresh.goto(app);
  await expect(fresh.getByRole('combobox', selector)).toHaveValue('books');
});

test('saving an external tracker option preserves updates from its install URL', async ({
  extension,
}) => {
  const {context, app} = extension;
  let version = '1.0';
  const server = createServer((_request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.end(
      JSON.stringify({
        version: 3,
        type: 'kit',
        description: {name: 'Update fixture', version},
        search: {url: 'https://example.invalid/search?q=%search%'},
        selectors: {row: {selector: 'article'}},
      }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Fixture did not start');
    const page = await context.newPage();
    await page.goto(new URL('popup.html', app).href);
    const downloadURL = `http://127.0.0.1:${address.port}/tracker.json`;
    await context.route(downloadURL, (route) => route.continue());
    const installed = await page.evaluate(
      (downloadURL) =>
        chrome.runtime.sendMessage({
          action: 'downloadTracker',
          id: 'update-fixture',
          downloadURL,
        }),
      downloadURL,
    );
    expect(installed).toEqual({result: true});
    await page.goto(`${app}#/editor/tracker/update-fixture`);
    await page.getByRole('checkbox', {name: 'Update automatically'}).uncheck();
    await page.getByRole('button', {name: 'Save*', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Save', exact: true})).toBeVisible();
    version = '2.0';
    expect(
      await page.evaluate(() =>
        chrome.runtime.sendMessage({action: 'updateTracker', id: 'update-fixture'}),
      ),
    ).toEqual({result: true});
    await page.reload();
    await expect(page.getByRole('textbox', {name: 'Tracker code'})).toContainText('2.0');
    await expect(page.getByRole('checkbox', {name: 'Update automatically'})).not.toBeChecked();
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('a local edit of a built-in tracker is used until the built-in tracker is restored', async ({
  extension,
}) => {
  const {context, worker, app} = extension;
  await worker.evaluate(async () => {
    await chrome.storage.local.set({
      profileId: 'books',
    });
    await chrome.storage.sync.set({
      profiles: [{id: 'books', name: 'Books', trackers: [{id: 'booktracker'}]}],
    });
  });
  const origin = 'https://booktracker.org';
  await context.route(`${origin}/custom?**`, (route) =>
    route.fulfill({body: '<article><a href="/item">Local result</a></article>'}),
  );
  await context.route(`${origin}/tracker.php?**`, (route) =>
    route.fulfill({
      body:
        '<table id="tor-tbl"><tbody><tr><td></td><td></td><td></td>' +
        '<td class="row4 med tLeft"><a href="/viewtopic.php?t=42">Built-in result</a></td>' +
        '</tr></tbody></table>',
    }),
  );
  const page = await context.newPage();
  await page.goto(`${app}#/editor/tracker/booktracker`);
  await page.getByRole('textbox', {name: 'Tracker code'}).fill(
    JSON.stringify({
      version: 3,
      type: 'kit',
      description: {name: 'Local Booktracker', version: '1.0'},
      search: {url: `${origin}/custom?q=%search%`},
      selectors: {
        row: {selector: 'article'},
        title: {selector: 'a', pipeline: [{name: 'getText'}]},
        url: {selector: 'a', pipeline: [{name: 'getProp', args: ['href']}]},
      },
    }),
  );
  await page.getByRole('button', {name: 'Save*', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Save', exact: true})).toBeVisible();
  await page.goto(`${app}#/search?query=book`);
  await expect(page.getByRole('link', {name: 'Local result'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', {name: 'Local result'})).toBeVisible();
  await page.goto(`${app}#/options/profiles/books`);
  const restore = page.getByRole('button', {name: 'Restore built-in tracker'});
  await restore.click();
  await expect(restore).toHaveCount(0);
  await page.goto(`${app}#/search?query=book`);
  await expect(page.getByRole('link', {name: 'Built-in result'})).toBeVisible();
});
