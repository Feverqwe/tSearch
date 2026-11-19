import {expect, type Page} from '@playwright/test';
import {test} from './extensionTest';

const origin = 'https://builder.example.test';
const sample = `${origin}/search?q=linux`;
const definition = {
  version: 3,
  type: 'kit',
  description: {
    name: 'Open Media Lab',
    icon: '#417bbc',
    version: '1.2',
    updateUrl: origin + '/legacy.json',
  },
  search: {method: 'GET', url: origin + '/search?q=%search%'},
  selectors: {
    row: {selector: 'article'},
    title: {selector: 'h2', pipeline: [{name: 'getText'}, {name: 'trim'}]},
    url: {selector: 'a[href]', pipeline: [{name: 'getProp', args: ['href']}]},
    seeds: {
      selector: '[data-seeds]',
      pipeline: [{name: 'getAttr', args: ['data-seeds']}, {name: 'toInt'}],
    },
  },
};

async function importTracker(page: Page, text: string) {
  await page.getByRole('button', {name: 'Import JSON'}).click();
  const dialog = page.getByRole('dialog', {name: 'Import JSON'});
  await dialog.getByRole('textbox').fill(text);
  await dialog.getByRole('button', {name: 'Import JSON'}).click();
  return dialog;
}

async function check(page: Page, phrase: string) {
  const query = page.getByRole('textbox', {name: 'Test query'});
  await query.fill(phrase);
  await page.getByRole('button', {name: 'Run check'}).click();
}

test('diagnostics name the failing field and method, and only required issues block export', async ({
  extension: {context, app},
}) => {
  await context.route(origin + '/search*', (route) => {
    const phrase = new URL(route.request().url()).searchParams.get('q');
    const link = phrase === 'bad-link' ? 'javascript:void(0)' : '/item/1';
    const body =
      phrase === 'empty'
        ? '<p class="message">No results found</p>'
        : `<article><h2> Release 1 </h2><a href="${link}">Item</a><span data-seeds="?"></span></article>` +
          '<article><strong>Release 2</strong><a href="/item/2">Item</a><span data-seeds="7"></span></article>';
    return route.fulfill({contentType: 'text/html', body});
  });
  const page = await context.newPage();
  await page.setViewportSize({width: 320, height: 690});
  await page.goto(app + '#/codeMaker/save?theme=light');
  const imported = await importTracker(page, JSON.stringify(definition));
  await expect(imported).toHaveCount(0);
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await check(page, 'linux');
  await expect(page.getByText('Results extracted: 1')).toBeVisible();
  await expect(page.getByText('Row 2 · No matching nodes')).toBeVisible();
  const optional = page.getByText('Optional field issues', {exact: false});
  const optionalDetail = page.getByText(/Transformation failed.*2\. toInt/);
  await expect(optional).toBeInViewport();
  await expect(optionalDetail).toBeHidden();
  await optional.press('Enter');
  await expect(optionalDetail).toBeVisible();
  const advance = page.getByRole('button', {name: 'Continue to code'});
  await expect(advance).toBeDisabled();
  const run = await page.getByRole('button', {name: 'Run check'}).boundingBox();
  expect(run!.x + run!.width).toBeLessThanOrEqual(320);

  const required = page.getByRole('heading', {name: 'Required fields to check'}).locator('..');
  await required.getByRole('button', {name: 'Fix'}).click();
  const title = page.locator('[data-id=title]');
  await expect(title).toBeFocused();
  await expect(page.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  await title.fill('[');
  await page.getByRole('link', {name: 'Result', exact: true}).click();
  await page.getByRole('button', {name: 'Run check'}).click();
  await expect(
    required.getByRole('paragraph').filter({hasText: /Row 1 · Invalid selector/}),
  ).toBeVisible();
  await required.getByRole('button', {name: 'Fix'}).click();
  await title.fill('h2, strong');
  await page.getByRole('link', {name: 'Result', exact: true}).click();
  await expect(page.getByText('The settings or query changed.', {exact: false})).toBeVisible();
  await check(page, 'bad-link');
  await expect(page.getByText('Row 1 · Invalid link')).toBeVisible();
  await expect(advance).toBeDisabled();
  await check(page, 'empty');
  await expect(page.getByText('The source contains no results.')).toBeVisible();
  await check(page, 'linux');
  await expect(page.getByText('Results extracted: 2')).toBeVisible();
  await expect(optional).toBeVisible();
  await expect(optionalDetail).toBeHidden();
  await expect(advance).toBeEnabled();
  expect((await optional.boundingBox())!.y).toBeLessThan(
    (await page.getByRole('table').boundingBox())!.y,
  );
});

test('the same isolated document moves between both panes and a separate window', async ({
  extension: {context, app},
}) => {
  let requests = 0;
  await context.route(sample, (route) => {
    requests++;
    return route.fulfill({
      contentType: 'text/html',
      body:
        '<body bgcolor="black" text="black" style="background: black; color: black">' +
        '<article><h2 class="title:full">Linux editions</h2><h2>Notes</h2><a href="/item/1">Details</a></article>' +
        '<table><tr><td bgcolor="white"><font color="white">Legacy colors</font></td></tr></table>' +
        '<form action="/send"><button>Submit fixture</button></form>' +
        '<script>document.body.dataset.fixtureRan = "true"</script>',
    });
  });
  const page = await context.newPage();
  await page.setViewportSize({width: 1150, height: 770});
  await page.goto(app + '#/codeMaker/search?theme=dark');
  await page.getByRole('textbox', {name: 'Results page address', exact: true}).fill(sample);
  await page.getByRole('button', {name: 'Open for manual setup'}).click();
  const frame = page.frameLocator('iframe');
  const split = page.getByRole('separator');
  await expect(frame.getByText('Linux editions')).toBeVisible();
  await expect(split).toHaveAttribute('aria-orientation', 'vertical');
  const expectPreviewColors = async (theme: 'dark' | 'light') => {
    const root = frame.locator('html');
    await expect(root).toHaveCSS('color-scheme', theme);
    const ink = await root.evaluate((element) => getComputedStyle(element).color);
    await expect(frame.getByText('Linux editions')).toHaveCSS('color', ink);
    await expect(frame.getByText('Legacy colors')).toHaveCSS('color', ink);
    await expect(frame.locator('body')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(frame.locator('td')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  };
  await expectPreviewColors('dark');
  await page.goto(app + '#/codeMaker/selectors?theme=light');
  await expectPreviewColors('light');
  await page.goto(app + '#/codeMaker/selectors?theme=dark');
  await page.locator('[data-id=row]').fill('article');
  await page.locator('[data-id=title-btn]').click();
  const help = page.getByRole('button', {name: 'Help — Torrent title'});
  await help.click();
  await page.keyboard.press('Escape');
  await expect(help).toBeFocused();
  const cancelSelection = page.getByRole('button', {name: 'Cancel selection'});
  await expect(cancelSelection).toBeVisible();
  await cancelSelection.click();

  await page.setViewportSize({width: 530, height: 770});
  await expect(split).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(frame.getByText('Linux editions')).toBeVisible();
  await page.setViewportSize({width: 1150, height: 770});
  await expect(split).toHaveAttribute('aria-orientation', 'vertical');

  const position = page.getByRole('button', {name: 'Preview position'});
  await position.click();
  await page.keyboard.press('Escape');
  await expect(position).toBeFocused();
  await position.click();
  const menu = page.getByRole('menu', {name: 'Preview position'});
  const separateWindow = menu.getByRole('menuitemradio', {name: 'Separate window'});
  const label = await separateWindow.getByText('Separate window', {exact: true}).boundingBox();
  const panel = await menu.boundingBox();
  expect(label!.x).toBeGreaterThanOrEqual(panel!.x);
  expect(label!.x + label!.width).toBeLessThanOrEqual(panel!.x + panel!.width);
  const [popup] = await Promise.all([page.waitForEvent('popup'), separateWindow.click()]);
  const popupFrame = popup.frameLocator('iframe');
  await expect(popupFrame.getByText('Linux editions')).toBeVisible();
  await expect(popupFrame.locator('html')).toHaveCSS('color-scheme', 'dark');
  await expect(popupFrame.locator('body')).not.toHaveAttribute('data-fixture-ran');
  await expect(popupFrame.locator('a')).not.toHaveAttribute('href');
  await expect(popupFrame.locator('form')).not.toHaveAttribute('action');
  await expect(popup.locator('iframe')).toHaveAttribute('sandbox', 'allow-same-origin');

  await page.locator('[data-id=title-btn]').click();
  await popupFrame.getByText('Linux editions').click();
  const title = page.locator('[data-id=title]');
  await expect(title).not.toHaveValue('');
  const titleSelector = await title.inputValue();
  await expect(popupFrame.locator('article').locator(titleSelector)).toHaveText('Linux editions');
  await popupFrame.getByText('Details').click();
  await expect(title).toHaveValue(titleSelector);
  await page.locator('[data-id=title-btn]').click();
  await popupFrame.getByText('Details').press('Escape');
  await expect(title).toHaveValue(titleSelector);
  await popup.close();
  await expect(page.getByRole('button', {name: 'Tracker page'})).toBeVisible();
  expect(requests).toBe(1);
});

test('import preserves legacy URLs and icon updates regenerate the same downloadable JSON', async ({
  extension: {context, app},
}) => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="7" fill="blue"/></svg>';
  await context.route(sample, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<article><h2>Linux editions</h2><a href="/item">Item</a></article>',
    }),
  );
  await context.route(origin + '/image.svg', (route) =>
    route.fulfill({contentType: 'image/svg+xml', body: svg}),
  );
  await context.route(origin + '/invalid.svg', (route) =>
    route.fulfill({contentType: 'image/svg+xml', body: '<html>invalid</html>'}),
  );
  const page = await context.newPage();
  await page.goto(app + '#/codeMaker/save');
  const imported = await importTracker(page, JSON.stringify(definition));
  await expect(imported).toHaveCount(0);
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await check(page, 'linux');
  await page.getByRole('button', {name: 'Continue to code'}).click();
  const generate = page.getByRole('button', {name: 'Generate JSON'});
  const json = page.getByRole('textbox', {name: 'Tracker JSON'});
  await generate.click();
  const first = await json.inputValue();
  const invalid = await importTracker(page, '{"bad":');
  await expect(invalid.getByRole('textbox')).toHaveValue('{"bad":');
  await expect(invalid.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  await invalid.getByRole('button', {name: 'Cancel'}).click();
  await expect(json).toHaveValue(first);
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await page.locator('a[href="#/codeMaker/desc"]').click();
  const icon = page.locator('[data-id=desk_tracker_icon]');
  await page.locator('input[type=file]').setInputFiles({
    name: 'icon.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(svg.replace('blue', 'red')),
  });
  await expect(icon).toHaveValue(
    'data:image/svg+xml;base64,' + Buffer.from(svg.replace('blue', 'red')).toString('base64'),
  );
  const fromUrl = page.getByRole('button', {name: 'From URL'});
  const dialog = page.getByRole('dialog', {name: 'From URL'});
  await fromUrl.click();
  await dialog.getByLabel('Image URL').fill(origin + '/image.svg');
  await dialog.getByRole('button', {name: 'Load image'}).click();
  const loaded = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  await expect(icon).toHaveValue(loaded);
  await fromUrl.click();
  await dialog.getByLabel('Image URL').fill(origin + '/invalid.svg');
  await dialog.getByRole('button', {name: 'Load image'}).click();
  await expect(dialog.getByText(/Use a valid PNG/)).toBeVisible();
  await dialog.getByRole('button', {name: 'Cancel'}).click();
  await expect(icon).toHaveValue(loaded);

  await page.getByRole('link', {name: 'Code', exact: true}).click();
  await expect(json).toHaveCount(0);
  await expect(page.getByText('Code is out of date.')).toBeVisible();
  await expect(generate).toBeEnabled();
  await page
    .getByRole('textbox', {name: 'JSON file URL', exact: true})
    .fill(origin + '/trackers/open-media.json');
  await generate.click();
  const exported = await json.inputValue();
  expect(JSON.parse(exported).description).toMatchObject({
    icon: loaded,
    updateUrl: definition.description.updateUrl,
    downloadUrl: origin + '/trackers/open-media.json',
  });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', {name: 'Download JSON'}).click(),
  ]);
  const stream = await download.createReadStream();
  const parts: Buffer[] = [];
  for await (const chunk of stream) parts.push(Buffer.from(chunk));
  expect(Buffer.concat(parts).toString()).toBe(exported);
});

test('setup keeps the active button and validates a single request from the form', async ({
  extension: {context, app},
}) => {
  let received = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await context.route(sample, async (route) => {
    received++;
    await gate;
    await route.fulfill({status: 503});
  });
  const page = await context.newPage();
  await page.goto(app + '#/codeMaker/unknown');
  const address = page.getByRole('textbox', {name: 'Results page address', exact: true});
  const detect = page.getByRole('button', {name: 'Open and detect fields'});
  const manual = page.getByRole('button', {name: 'Open for manual setup'});
  const help = page.getByRole('button', {name: 'Help — Results page address'});
  await help.click();
  await page.mouse.click(3, 3);
  await expect(help).toBeFocused();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await address.fill('ftp://builder.example.test');
  await detect.click();
  await expect(address).toHaveAttribute('aria-invalid', 'true');
  await address.fill(sample);
  const size = async () => {
    const {width, height} = (await detect.boundingBox())!;
    return {width, height};
  };
  const before = await size();
  await detect.click();
  await expect(detect).toBeFocused();
  await expect(detect).toHaveAttribute('aria-busy', 'true');
  expect(await size()).toEqual(before);
  await expect(manual).toBeDisabled();
  await address.press('Enter');
  release();
  await expect(page.getByRole('status')).toContainText('The tracker returned an error.');
  expect(received).toBe(1);
  expect(await size()).toEqual(before);
  await expect(detect).toBeEnabled();
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await page.getByRole('link', {name: 'Fields', exact: true}).click();
  await page.goBack();
  await expect(page.getByRole('heading', {name: 'Result'})).toBeVisible();
  await page.goBack();
  await expect(address).toHaveValue(sample);
  await page.goForward();
  await expect(page.getByRole('heading', {name: 'Result'})).toBeVisible();
});

test('configuration errors block export even when extraction succeeds', async ({
  extension: {context, app},
}) => {
  await context.route(sample, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<article><h2>Linux editions</h2><a href="/item">Item</a></article>',
    }),
  );
  const imported = {
    ...definition,
    auth: {loginForm: {selector: '['}},
    selectors: {
      ...definition.selectors,
      seeds: {
        selector: '.missing',
        pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['[', '']}],
      },
    },
  };
  const page = await context.newPage();
  await page.goto(app + '#/codeMaker/save');
  await importTracker(page, JSON.stringify(imported));
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await check(page, 'linux');
  await expect(page.getByText('Results extracted: 1')).toBeVisible();
  const blocking = page.getByRole('heading', {name: 'Issues blocking export'}).locator('..');
  await expect(blocking.getByText('Login form selector')).toBeVisible();
  await expect(blocking.getByText(/Transformation failed.*2\. replaceRe/)).toBeVisible();
  await expect(page.getByRole('button', {name: 'Continue to code'})).toBeDisabled();
  await page.getByRole('link', {name: 'Code', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Generate JSON'})).toBeDisabled();
});

test('a successful later page cannot hide an earlier extraction error', async ({
  extension: {context, app},
}) => {
  await context.route(origin + '/search*', (route) => {
    const hasNext = !new URL(route.request().url()).searchParams.has('page');
    return route.fulfill({
      contentType: 'text/html',
      body: hasNext
        ? '<article><h2>Linux editions</h2><a href="/item">Item</a></article>' +
          '<article><a href="/missing-title">Missing title</a></article>' +
          '<a rel="next" href="?q=linux&page=2">Next</a>'
        : '<article><h2>More Linux editions</h2><a href="/other">Other</a></article>',
    });
  });
  const page = await context.newPage();
  await page.goto(app + '#/codeMaker/save');
  await importTracker(
    page,
    JSON.stringify({
      ...definition,
      selectors: {
        ...definition.selectors,
        nextPageUrl: {selector: 'a[rel=next]', pipeline: [{name: 'getProp', args: ['href']}]},
      },
    }),
  );
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await check(page, 'linux');
  await expect(
    page.getByRole('paragraph').filter({hasText: 'Row 2 · No matching nodes'}),
  ).toBeVisible();
  await page.getByRole('button', {name: 'Next page'}).click();
  await expect(page.getByText('More Linux editions')).toBeVisible();
  await expect(page.getByText('Another checked page has errors that block export.')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Continue to code'})).toBeDisabled();
});

test('field help opens a compact described dialog and nested help preserves edits', async ({
  extension: {context, app},
}) => {
  const page = await context.newPage();
  await page.setViewportSize({width: 320, height: 710});
  await page.goto(app + '#/codeMaker/search?theme=dark');
  const opener = page.getByRole('button', {name: 'Help — Results page address'});
  await opener.click();
  const help = page.getByRole('dialog', {name: 'Results page address'});
  await expect(help).toHaveAccessibleDescription(/Paste the address of a page/);
  await expect(help.getByRole('heading', {name: 'How it works'})).toBeVisible();
  await expect(help.getByRole('heading', {name: 'Example'})).toBeVisible();
  const narrow = (await help.boundingBox())!;
  expect(narrow.x + narrow.width).toBeLessThan(320);
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();

  await page.setViewportSize({width: 1280, height: 800});
  await opener.click();
  const wide = (await help.boundingBox())!;
  expect(wide.width).toBeLessThan(narrow.width * 2);
  await page.mouse.move(wide.x + wide.width / 2, wide.y + 25);
  await page.mouse.down();
  await page.mouse.move(4, 4);
  await page.mouse.up();
  await expect(help).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(opener).toBeFocused();

  await page.getByRole('link', {name: 'Code', exact: true}).click();
  await importTracker(
    page,
    JSON.stringify({
      ...definition,
      selectors: {
        ...definition.selectors,
        title: {selector: 'h2', pipeline: [{name: 'replaceRe', args: ['x', '']}]},
      },
    }),
  );
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await page.getByRole('link', {name: 'Fields', exact: true}).click();
  const title = page.locator('[data-id=title]').locator('..');
  await title.getByRole('button', {name: 'Transformations'}).click();
  const editor = page.getByRole('dialog', {name: /Transformations.*Torrent title/i});
  const pattern = editor.getByRole('textbox', {name: 'Pattern', exact: true});
  await pattern.fill('^Linux');
  const helpButton = editor.getByRole('button', {name: 'Help — Pattern'});
  await helpButton.click();
  const nested = page.getByRole('dialog', {name: 'Pattern', exact: true});
  await expect(nested).toHaveAccessibleDescription(/regular expression/);
  await expect(nested.getByText('^Seeders:\\s*', {exact: true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(helpButton).toBeFocused();
  await expect(pattern).toHaveValue('^Linux');
});

test('request checks respect the connection rules of the installed tracker', async ({
  extension: {context, app},
}) => {
  let sent = false;
  await context.route(sample, (route) => {
    sent = true;
    return route.fulfill({
      contentType: 'text/html',
      body: '<article><h2>Result</h2><a href="/item">Item</a></article>',
    });
  });
  const page = await context.newPage();
  await page.goto(app + '#/codeMaker/save');
  await importTracker(
    page,
    JSON.stringify({
      ...definition,
      search: {...definition.search, originUrl: 'https://other.example.test/'},
    }),
  );
  await page.getByRole('link', {name: 'Check', exact: true}).click();
  await check(page, 'linux');
  await expect(page.getByText(/outside the tracker’s allowed origins/)).toBeVisible();
  await expect(page.getByRole('button', {name: 'Continue to code'})).toBeDisabled();
  expect(sent).toBe(false);
});
