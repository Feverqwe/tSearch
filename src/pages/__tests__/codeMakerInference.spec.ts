import {createServer} from 'node:http';

import {type Page, expect} from '@playwright/test';

import {test} from './extensionTest';

import pageModel from '../../tools/trackerInference/page-model.json' with {type: 'json'};

const detect = (page: Page) => page.getByRole('button', {name: 'Open and detect fields'});
const report = (page: Page) =>
  page.getByRole('complementary', {name: 'Automatic detection report'});

function results(count = 25, form = '') {
  return (
    `<html><body>${form}<table><thead><tr><th>Title</th><th>Size</th><th>Date</th><th>Seeds</th><th>Peers</th><th>Comments</th></tr></thead><tbody>` +
    Array.from(
      {length: count},
      (_, index) =>
        `<tr><td><a href="/torrent/${index + 1}">Release ${index + 1}</a></td><td>${index === 24 ? '2,5' : '1,234'} MiB</td><td>${index === 24 ? '17/04/2026' : '03/04/2026'}</td><td>—</td><td>—</td><td class="s">29</td></tr>`,
    ).join('') +
    '</tbody></table></body></html>'
  );
}

async function readCode(page: Page) {
  await page.locator('a[href="#/codeMaker/save"]').click();
  const generate = page.getByRole('button', {name: 'Generate JSON'});
  await expect(generate).toBeEnabled();
  await generate.click();
  return JSON.parse(await page.locator('[data-id="save_code_textarea"]').inputValue());
}

for (const scenario of ['declared', 'fallback', 'manual'] as const) {
  test(`automatic setup handles the ${scenario} tracker icon`, async ({extension}) => {
    const {context, app} = extension;
    const searchPath = '/browse/results?q=linux';
    const markup =
      scenario === 'fallback'
        ? '<link rel="icon" href="broken.svg">'
        : '<link rel="icon" href="icon.svg">';
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="blue"/></svg>';
    const expected = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
    const requests: string[] = [];
    const server = createServer((request, response) => {
      if (request.url === searchPath) {
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        return response.end(results().replace('<html>', '<html><head>' + markup + '</head>'));
      }
      requests.push(request.url ?? '');
      response.setHeader('Content-Type', 'image/svg+xml');
      return response.end(request.url === '/browse/broken.svg' ? '<html>Not an icon</html>' : svg);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Fixture did not start');
      const fixture = `http://127.0.0.1:${address.port}${searchPath}`;
      // Playwright aborts any intercepted request ending in /favicon.ico.
      await context.unrouteAll();
      const page = await context.newPage();
      await page.goto(`${app}#/codeMaker/${scenario === 'manual' ? 'desc' : 'search'}`);
      if (scenario === 'manual') {
        await page.locator('[data-id="desk_tracker_icon"]').fill('#417bbc');
        await page.locator('a[href="#/codeMaker/search"]').click();
      }
      await page.getByRole('textbox', {name: 'Results page address', exact: true}).fill(fixture);
      await page.locator('[name=search-query]').fill('linux');
      await detect(page).click();
      await expect(report(page)).toContainText('Detected fields in 25 result rows');
      const code = await readCode(page);
      expect(code.description.icon).toBe(scenario === 'manual' ? '#417bbc' : expected);
      expect(requests).toEqual(
        scenario === 'manual'
          ? []
          : scenario === 'fallback'
            ? ['/browse/broken.svg', '/favicon.ico']
            : ['/browse/icon.svg'],
      );
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
}

test('a missing download cell leaves that release without a link and preserves other rows', async ({
  extension,
}) => {
  const {context, app} = extension;
  const origin = 'https://inference.example.test';
  const fixture = origin + '/results?q=linux';
  await context.route(fixture, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body:
        '<table><thead><tr><th>Title</th><th>Download</th><th>Size</th><th>Seeds</th></tr></thead><tbody>' +
        '<tr><td><a href="/ep/1">First release</a></td><td>1 GiB</td><td>7</td></tr>' +
        '<tr><td><a href="/ep/2">Second release</a></td><td><a href="/two.torrent">Download</a></td><td>2 GiB</td><td>9</td></tr>' +
        '</tbody></table>',
    }),
  );
  const page = await context.newPage();
  await page.goto(`${app}#/codeMaker/search`);
  await page.getByRole('textbox', {name: 'Results page address', exact: true}).fill(fixture);
  await page.locator('[name=search-query]').fill('linux');
  await detect(page).click();
  await expect(report(page)).toContainText('Detected fields in 2 result rows');
  await page.getByRole('button', {name: 'All fields', exact: true}).click();
  const table = page.locator('.maker-result-data table');
  const first = table.getByRole('row', {name: /First release/});
  const second = table.getByRole('row', {name: /Second release/});
  await expect(first.getByRole('link')).toHaveCount(1);
  await expect(second.locator(`a[href="${origin}/two.torrent"]`)).toHaveCount(1);
  expect((await readCode(page)).selectors.downloadUrl).toBeDefined();
});

test('page fields depend on learned weights and do not bypass the neural block', async ({
  extension,
}) => {
  const {context, app} = extension;
  const fixture = 'https://inference.example.test/results?q=linux';
  const html = results()
    .replace(
      '<html>',
      '<html><head><meta property="og:site_name" content="Learned site name"><meta name="description" content="Learned description"></head>',
    )
    .replace(
      '</body>',
      '<a href="/login">Sign in</a><a rel="next" href="?q=linux&page=2">Next</a></body>',
    );
  await context.route(fixture, (route) => route.fulfill({contentType: 'text/html', body: html}));
  await context.route(
    (url) =>
      url.protocol === 'chrome-extension:' &&
      url.pathname.includes('page-weights') &&
      url.pathname.endsWith('.bin'),
    async (route) => {
      await route.fulfill({
        contentType: 'application/octet-stream',
        body: Buffer.alloc(pageModel.parameters * 4),
      });
    },
  );
  const page = await context.newPage();
  await page.goto(`${app}#/codeMaker/search`);
  await page.locator('[data-id="url"]').fill(fixture);
  await page.getByRole('textbox', {name: 'Query on this page', exact: true}).fill('linux');
  await detect(page).click();
  await expect(report(page)).toContainText('Detected fields in 25 result rows');
  const code = await readCode(page);
  expect(code.description.name).not.toBe('Learned site name');
  expect(code.description.description).toBeUndefined();
  expect(code.auth).toBeUndefined();
  expect(code.selectors.nextPageUrl).toBeUndefined();
});

test('text node pagination is detected without exporting a nonportable rule', async ({
  extension,
}) => {
  const {context, app} = extension;
  const fixture = (page: number) => `https://inference.example.test/results?q=linux&page=${page}`;
  await context.route('https://inference.example.test/results*', (route) => {
    const current = Number(new URL(route.request().url()).searchParams.get('page') ?? 1);
    const prior = current > 1 ? '<a href="?q=linux&page=1">1</a> ' : '';
    const next = current < 3 ? ` <a href="?q=linux&page=${current + 1}">${current + 1}</a>` : '';
    return route.fulfill({
      contentType: 'text/html',
      body: results().replace(
        '</body>',
        `<div id="index"><b>Pages: ${prior}${current}${next}</b></div></body>`,
      ),
    });
  });
  const page = await context.newPage();
  await page.goto(`${app}#/codeMaker/search`);
  await page.locator('[data-id="url"]').fill(fixture(1));
  await page.getByRole('textbox', {name: 'Query on this page', exact: true}).fill('linux');
  await detect(page).click();
  await expect(report(page)).toContainText(fixture(2));
  await expect(report(page)).toContainText('needs a manual pagination rule');
  const code = await readCode(page);
  expect(code.selectors.nextPageUrl).toBeUndefined();
});

for (const kind of ['next', 'same-page'] as const)
  test(`head pagination handles ${kind} and ignores logout and disabled links`, async ({
    extension,
  }) => {
    const {context, app} = extension;
    const origin = 'https://inference.example.test';
    const fixture = origin + '/results?q=linux&page=1';
    const target = kind === 'next' ? '?q=linux&page=2' : '?page=1&q=linux#navigation';
    const html = results()
      .replace('<html>', `<html><head><link rel="next" href="${target}"></head>`)
      .replace(
        '<body>',
        '<body><a href="/auth/logout">Log out</a><a href="https://other.example.test/login">Sign in</a>',
      )
      .replace(
        '</body>',
        '<nav class="pagination"><a href="?q=linux&page=0">Previous</a><a class="next disabled" aria-disabled="true" href="?q=linux&page=3">Next</a></nav></body>',
      );
    await context.route(fixture, (route) => route.fulfill({contentType: 'text/html', body: html}));
    const page = await context.newPage();
    await page.goto(`${app}#/codeMaker/search`);
    await page.locator('[data-id="url"]').fill(fixture);
    await page.getByRole('textbox', {name: 'Query on this page', exact: true}).fill('linux');
    await detect(page).click();
    await expect(report(page)).toContainText('Detected fields in 25 result rows');
    if (kind === 'next')
      await expect(report(page)).toContainText(origin + '/results?q=linux&page=2');
    const code = await readCode(page);
    expect(code.auth).toBeUndefined();
    if (kind === 'next') expect(code.selectors.nextPageUrl).toBeDefined();
    else expect(code.selectors.nextPageUrl).toBeUndefined();
  });

test('page metadata, login link and text pagination fill the constructor and remain visible', async ({
  extension,
}) => {
  const {context, app} = extension;
  const origin = 'https://inference.example.test';
  const fixture = origin + '/results?q=linux&page=1';
  const html = results()
    .replace(
      '<html>',
      '<html><head><title>Search results</title><meta property="og:site_name" content="Library tracker"><meta name="description" content="Find independent releases"></head>',
    )
    .replace(
      '<body>',
      '<body><header><a href="/login">Sign in</a><form id="quick-login"><input name="username"><input type="password"></form></header>',
    )
    .replace(
      '</body>',
      '<nav class="pagination"><a href="?q=linux&page=0">Previous</a><a href="?q=linux&page=2">Next\n page</a></nav></body>',
    );
  await context.route(fixture, (route) => route.fulfill({contentType: 'text/html', body: html}));
  await context.route(origin + '/login', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<title>Login</title><form id="signin"><input name="username"><input type="password"></form>',
    }),
  );
  const page = await context.newPage();
  await page.goto(`${app}#/codeMaker/search`);
  await page.locator('[data-id="url"]').fill(fixture);
  await page.getByRole('textbox', {name: 'Query on this page', exact: true}).fill('linux');
  await detect(page).click();
  const status = report(page);
  await expect(status).toContainText('Detected fields in 25 result rows');
  await expect(status).toContainText('Library tracker');
  await expect(status).toContainText('Find independent releases');
  await expect(status).toContainText(origin + '/login');
  await expect(status).toContainText(origin + '/results?q=linux&page=2');
  await page.locator('a[href="#/codeMaker/desc"]').click();
  await expect(page.locator('[data-id="name"]')).toHaveValue('Library tracker');
  await expect(page.locator('[data-id="description"]')).toHaveValue('Find independent releases');
  await page.locator('a[href="#/codeMaker/selectors"]').click();
  await page.locator('[data-id="nextPageUrl"]').press('End');
  await expect(page.locator('[data-id="nextPageUrl-result"]')).toHaveValue(
    origin + '/results?q=linux&page=2',
  );
  const code = await readCode(page);
  expect(code.auth).toEqual({url: origin + '/login'});
  await page.locator('a[href="#/codeMaker/check"]').click();
  await page.locator('a[href="#/codeMaker/auth"]').click();
  await expect(page.locator('[data-id="url"]')).toHaveValue(origin + '/login');
  await page.locator('[data-id="auth_open"]').click();
  await expect(page.frameLocator('iframe').locator('#signin')).toBeVisible();
  await page.getByRole('checkbox', {name: 'Login form selector'}).check();
  await page.locator('[data-id="loginForm-btn"]').click();
  await page.frameLocator('iframe').locator('#signin').click();
  await expect(page.locator('[data-id="loginForm"]')).toHaveValue('#signin');
});

test('numeric pagination follows the current page and does not return a previous page at the end', async ({
  extension,
}) => {
  const {context, app} = extension;
  const origin = 'https://inference.example.test';
  const fixture = (page: number) => origin + `/results?q=linux&page=${page}`;
  await context.route(origin + '/results*', (route) => {
    const current = Number(new URL(route.request().url()).searchParams.get('page'));
    const previous = current > 1 ? `<a href="?q=linux&page=${current - 1}">${current - 1}</a>` : '';
    const next =
      current < 3
        ? `<a href="?q=linux&page=${current + 1}">${current + 1}</a>`
        : '<span class="next disabled">Next</span>';
    const html = results()
      .replace('<html>', '<html><head><title>Example search</title></head>')
      .replace(
        '</body>',
        `<div class="pagination">${previous}<span aria-current="page">${current}</span>${next}</div></body>`,
      );
    return route.fulfill({contentType: 'text/html', body: html});
  });
  const page = await context.newPage();
  await page.goto(`${app}#/codeMaker/search`);
  await page.locator('[data-id="url"]').fill(fixture(1));
  await page.getByRole('textbox', {name: 'Query on this page', exact: true}).fill('linux');
  await detect(page).click();
  await expect(report(page)).toContainText(fixture(2));
  let fail = true;
  await context.route(fixture(2), async (route) => {
    if (fail) {
      fail = false;
      await route.fulfill({status: 500});
    } else {
      await route.fallback();
    }
  });
  const next = page.getByRole('button', {name: 'Next page'});
  await next.click();
  await expect(page.getByText('The tracker returned an error.', {exact: false})).toBeVisible();
  await expect(page.getByText('Page 1', {exact: true})).toBeVisible();
  await next.click();
  await expect(page.getByText('Page 2', {exact: true})).toBeVisible();
  await next.click();
  await expect(page.getByText('Page 3', {exact: true})).toBeVisible();
  await expect(next).toHaveCount(0);
  await page.getByRole('button', {name: 'Previous page'}).click();
  await expect(page.getByText('Page 2', {exact: true})).toBeVisible();
  await expect(next).toBeVisible();
});

test('automatic setup fills editable fields using all rows, preserves metadata and exports the config', async ({
  extension,
}) => {
  const {context, app} = extension;
  const fixture = 'https://inference.example.test/results?q=linux';
  await context.route(fixture, (route) =>
    route.fulfill({contentType: 'text/html', body: results()}),
  );
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${app}#/codeMaker/desc`);
  await page.locator('[data-id="name"]').fill('My tracker');
  await page.locator('a[href="#/codeMaker/search"]').click();
  await page.getByRole('textbox', {name: 'Results page address', exact: true}).fill(fixture);
  await page.locator('[name=search-query]').fill('linux');
  await detect(page).click();
  await expect(report(page)).toContainText('Detected fields in 25 result rows');
  await expect(report(page)).toContainText('Search query template found');
  await report(page).getByText('Detected fields', {exact: true}).click();
  await report(page).getByRole('button', {name: 'Highlight matches — Result row selector'}).click();
  await expect(page.getByText('Result row selector · Matches: 25')).toBeVisible();
  await expect(page.frameLocator('iframe').locator('tr.kit_select')).toHaveCount(25);

  await page.locator('a[href="#/codeMaker/selectors"]').click();
  await page.locator('[data-id="size"]').press('End');
  await expect(page.locator('[data-id="size-result"]')).toHaveValue(
    String(Math.round(1.234 * 1024 ** 2)),
  );
  await page.locator('[data-id="date"]').press('End');
  const expected = await page.evaluate(() => new Date(2026, 3, 3).getTime() / 1000);
  await expect(page.locator('[data-id="date-result"]')).toHaveValue(String(expected));
  await expect(page.locator('[data-id="seeds-optional"]')).not.toBeChecked();
  await expect(page.locator('[data-id="peers-optional"]')).not.toBeChecked();
  const code = await readCode(page);
  expect(code.description.name).toBe('My tracker');
  expect(code.search).toMatchObject({
    method: 'GET',
    url: 'https://inference.example.test/results',
    query: 'q=%search%',
  });
  expect(code.selectors.size).toBeDefined();
  // A generated rule remains editable through the normal constructor.
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await page.locator('a[href="#/codeMaker/selectors"]').click();
  await page.locator('[data-id="title"]').fill('td:first-child a');
  await page.locator('a[href="#/codeMaker/save"]').click();
  await expect(page.getByRole('button', {name: 'Generate JSON'})).toBeDisabled();
  await expect(page.getByText('Code is out of date.')).toBeVisible();
  await page.locator('a[href="#/codeMaker/check"]').click();
  await page.getByRole('button', {name: 'Run check'}).click();
  await expect(page.getByRole('button', {name: 'Continue to code'})).toBeEnabled();
  const edited = await readCode(page);
  expect(edited.selectors.title.selector).toBe('td:first-child a');
  expect(errors).toEqual([]);
});

for (const source of ['form', 'request'] as const)
  test(`automatic setup determines POST search from ${source}`, async ({extension}) => {
    const {context, app} = extension;
    const fixture = 'https://inference.example.test/results';
    const body = results(
      25,
      source === 'form'
        ? '<form action="/search" method="post"><input type="search" name="q" value="linux"><input name="category" value="all"></form>'
        : '',
    );
    await context.route(fixture, (route) => route.fulfill({contentType: 'text/html', body}));
    const page = await context.newPage();
    await page.goto(`${app}#/codeMaker/search`);
    await page.locator('[data-id="url"]').fill(fixture);
    if (source === 'request') {
      await page.getByText('Request options', {exact: true}).click();
      await page.getByLabel('Method', {exact: true}).selectOption('POST');
      await page.locator('[data-id="body"]').fill('q=linux&category=all');
      await page.getByLabel('Query on this page', {exact: true}).fill('linux');
    }
    await detect(page).click();
    await expect(report(page)).toContainText('Search query template found');
    if (source === 'form') {
      await expect(page.getByText(/Run a check with the current request/)).toBeVisible();
      await expect(page.getByRole('button', {name: 'Continue to code'})).toBeDisabled();
      await page.getByRole('link', {name: 'Code', exact: true}).click();
      await expect(page.getByRole('button', {name: 'Generate JSON'})).toBeDisabled();
      await page.getByRole('link', {name: 'Check', exact: true}).click();

      const endpoint = 'https://inference.example.test/search';
      await context.route(endpoint, (route) => route.fulfill({contentType: 'text/html', body}));
      await page.getByRole('textbox', {name: 'Test query'}).fill('Sintel');
      const [request] = await Promise.all([
        page.waitForRequest(endpoint),
        page.getByRole('button', {name: 'Run check'}).click(),
      ]);
      expect(request.method()).toBe('POST');
      expect(request.postData()).toBe('q=Sintel&category=all');
      await expect(page.getByRole('button', {name: 'Continue to code'})).toBeEnabled();
    }
    const code = await readCode(page);
    expect(code.search.method).toBe('POST');
    expect(code.search.url).toBe(
      source === 'form' ? 'https://inference.example.test/search' : fixture,
    );
    expect(code.search.body).toBe('q=%search%&category=all');
  });

test('unknown search and ambiguous formats are reported without inventing fields', async ({
  extension,
}) => {
  const {context, app} = extension;
  const fixture = 'https://inference.example.test/results';
  await context.route(fixture, (route) =>
    route.fulfill({contentType: 'text/html', body: results(2)}),
  );
  const page = await context.newPage();
  await page.goto(`${app}#/codeMaker/search`);
  await page.locator('[data-id="url"]').fill(fixture);
  await detect(page).click();
  await expect(report(page)).toContainText('Search query template not found');
  await expect(report(page)).toContainText('ambiguous format; field omitted');
  const code = await readCode(page);
  expect(code.search.url).toBe(fixture);
  expect(code.search.url).not.toContain('%search%');
  expect(code.selectors.size).toBeUndefined();
  expect(code.selectors.date).toBeUndefined();
});

test('a delayed analysis does not overwrite edits made while the model loads', async ({
  extension,
}) => {
  const {context, app} = extension;
  const fixture = 'https://inference.example.test/results?q=linux';
  await context.route(fixture, (route) =>
    route.fulfill({contentType: 'text/html', body: results()}),
  );
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let arrived!: () => void;
  const started = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  await context.route(
    (url) => url.protocol === 'chrome-extension:' && url.pathname.endsWith('.bin'),
    async (route) => {
      arrived();
      await gate;
      await route.continue();
    },
  );
  const page = await context.newPage();
  await page.goto(`${app}#/codeMaker/search`);
  await page.locator('[data-id="url"]').fill(fixture);
  await detect(page).click();
  await started;
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await page.getByRole('link', {name: 'Fields', exact: true}).click();
  await page.locator('[data-id="row"]').fill('article.manual');
  release();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-id="row"]')).toHaveValue('article.manual');
  await expect(report(page)).toHaveCount(0);
  await page.getByRole('link', {name: 'Setup', exact: true}).click();
  await detect(page).click();
  await expect(report(page)).toContainText('Detected fields in 25 result rows');
  await page.getByRole('link', {name: 'Fields', exact: true}).click();
  await expect(page.locator('[data-id="row"]')).not.toHaveValue('article.manual');
});

test('model loading failure preserves the draft and allows another attempt', async ({
  extension,
}) => {
  const {context, app} = extension;
  const fixture = 'https://inference.example.test/results?q=linux';
  await context.route(fixture, (route) =>
    route.fulfill({contentType: 'text/html', body: results()}),
  );
  let fail = true;
  await context.route(
    (url) => url.protocol === 'chrome-extension:' && url.pathname.endsWith('.bin'),
    async (route) => {
      if (fail) {
        fail = false;
        await route.fulfill({status: 503, body: ''});
      } else await route.continue();
    },
  );
  const page = await context.newPage();
  await page.goto(`${app}#/codeMaker/search`);
  await page.locator('[data-id="url"]').fill(fixture);
  await detect(page).click();
  await expect(page.getByRole('status')).toContainText('Your settings were kept');
  await expect(page.locator('[data-id="url"]')).toHaveValue(fixture);
  await detect(page).click();
  await expect(report(page)).toContainText('Detected fields in 25 result rows');
});

test('sign-in, an empty source and unsupported HTML are distinct and keep result selectors', async ({
  extension,
}) => {
  const {context, app} = extension;
  const fixture = 'https://inference.example.test/';
  await context.route(fixture + 'login*', (route) =>
    route.fulfill({
      status: route.request().url().endsWith('401') ? 401 : 200,
      contentType: 'text/html',
      body: '<form id="signin"><input name="username"><input type="password" name="password"></form>',
    }),
  );
  await context.route(fixture + 'empty', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<div class="message">No results found</div><form><input name="username"><input type="password"></form>',
    }),
  );
  await context.route(fixture + 'about', (route) =>
    route.fulfill({contentType: 'text/html', body: '<h1>About the tracker</h1><p>Welcome.</p>'}),
  );
  const page = await context.newPage();
  await page.goto(`${app}#/codeMaker/search`);
  const cases = [
    ['login', 'This page requires sign-in.', true],
    ['login401', 'This page requires sign-in.', true],
    ['empty', 'No search results.', false],
    ['about', 'Could not identify search results.', false],
  ] as const;
  for (const [route, expected, login] of cases) {
    await page.locator('a[href="#/codeMaker/search"]').click();
    await page
      .getByRole('textbox', {name: 'Results page address', exact: true})
      .fill(fixture + route);
    await detect(page).click();
    await expect(page.getByRole('status')).toContainText(expected);
    if (login) {
      await expect(page.getByRole('link', {name: 'Sign in to the tracker'})).toBeVisible();
    }
    const check = page.getByRole('link', {name: 'Check', exact: true});
    await check.click();
    await page.getByRole('link', {name: 'Fields', exact: true}).click();
    await expect(page.locator('[data-id="row"]')).toHaveValue('');
    if (login) {
      await page.locator('a[href="#/codeMaker/auth"]').click();
      await expect(page.locator('[data-id="loginForm"]')).toHaveValue('#signin');
    }
  }
});
