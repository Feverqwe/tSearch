import {expect} from '@playwright/test';
import {createServer} from 'node:http';
import {test} from './extensionTest';

test('the builder sends POST through a site tab with cookies and exports its request mode', async ({
  extension,
}) => {
  const {context, app} = extension;
  const received: {method?: string; body: string; cookie?: string}[] = [];
  const server = createServer(async (request, response) => {
    if (request.url === '/') {
      response.setHeader('Set-Cookie', 'builder_session=ready; SameSite=Lax; Path=/');
      response.end('<title>Site session</title>');
      return;
    }
    if (request.url === '/search') {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      received.push({
        method: request.method,
        body: Buffer.concat(chunks).toString(),
        cookie: request.headers.cookie,
      });
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end('<article><a href="/item">Site tab result</a></article>');
      return;
    }
    response.end();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Fixture did not start');
    const origin = `http://127.0.0.1:${address.port}`;
    await context.route(`${origin}/**`, (route) => route.continue());
    const page = await context.newPage();
    await page.goto(`${app}#/codeMaker/search`);
    await page.locator('[data-id=url]').fill(`${origin}/search`);
    const throughTab = page.getByRole('checkbox', {name: 'Requests through a tab'});
    await page.getByText('Request options', {exact: true}).click();
    await throughTab.check();
    await page.getByLabel('Method', {exact: true}).selectOption('POST');
    await page.locator('[data-id=body]').fill('q=%search%');
    await page.locator('input[name=search-query]').fill('Cinema');
    await page.getByRole('button', {name: 'Open for manual setup'}).click();
    await expect(page.frameLocator('iframe').getByText('Site tab result')).toBeVisible();
    expect(received).toEqual([{method: 'POST', body: 'q=Cinema', cookie: 'builder_session=ready'}]);
    await page.locator('[data-id=row]').fill('article');
    await page.locator('[data-id=title]').fill('a');
    await page.locator('.maker-selector [data-id=url]').fill('a');
    await page.getByRole('link', {name: 'Result', exact: true}).click();
    await page.getByRole('button', {name: 'Run check'}).click();
    await page.getByRole('button', {name: 'Continue to code'}).click();
    const text = page.locator('[data-id=save_code_textarea]');
    await page.getByRole('button', {name: 'Generate JSON'}).click();
    const raw = await text.inputValue();
    expect(JSON.parse(raw).description.requestMode).toBe('tab');

    await page.getByRole('button', {name: 'Import JSON'}).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox').fill(raw);
    await dialog.getByRole('button', {name: 'Import JSON'}).click();
    await page.getByRole('link', {name: 'Setup', exact: true}).click();
    await page.getByText('Request options', {exact: true}).click();
    await expect(throughTab).toBeChecked();
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
