import {expect} from '@playwright/test';
import {test} from './extensionTest';

for (const action of ['search button', 'Tab', 'Enter', 'Escape', 'blur', 'option click']) {
  test(`search suggestion preview and ${action} in the page and popup`, async ({extension}) => {
    const {context, app} = extension;
    const suggestions = [
      'Sintel',
      ...Array.from({length: 16}, (_, index) => `Sintel clip ${index + 1}`),
      'Sintel soundtrack',
    ];
    await context.route('https://suggestqueries.google.com/**', (route) =>
      route.fulfill({json: ['Sin', suggestions]}),
    );
    for (const popup of [false, true]) {
      const page = await context.newPage();
      if (popup) await page.setViewportSize({width: 550, height: 220});
      await page.goto(popup ? new URL('popup.html', app).href : app);
      const input = page.getByRole('combobox', {name: 'Search', exact: true});
      await input.fill('Sin');
      const first = page.getByRole('option', {name: 'Sintel', exact: true});
      const last = page.getByRole('option', {name: 'Sintel soundtrack', exact: true});
      await expect(first).toBeInViewport();
      await expect(last).not.toBeInViewport();
      await input.press('ArrowDown');
      await expect(input).toHaveValue('Sintel');
      await input.press('ArrowUp');
      await expect(last).toHaveAttribute('aria-selected', 'true');
      await expect(last).toBeInViewport();
      await expect(input).toHaveValue('Sintel soundtrack');

      const button = page.getByRole('button', {name: 'Search', exact: true});
      let query = 'Sintel soundtrack';
      if (action === 'Escape' || action === 'blur') {
        if (action === 'Escape') await input.press('Escape');
        else await input.blur();
        await expect(input).toHaveValue('Sin');
        await expect(page.getByRole('listbox')).toHaveCount(0);
        query = 'Sin';
      } else if (action === 'option click') {
        query = 'Sintel clip 16';
      }

      const result = popup ? context.waitForEvent('page') : Promise.resolve(page);
      if (action === 'Tab') {
        await input.press('Tab');
        await expect(button).toBeFocused();
        await button.press('Enter');
      } else if (action === 'Enter') {
        await input.press('Enter');
      } else if (action === 'option click') {
        await page.getByRole('option', {name: query, exact: true}).click();
      } else {
        await button.click();
      }
      const resultsPage = await result;
      await expect(resultsPage).toHaveURL(`${app}#/search?${new URLSearchParams({query})}`);
      await expect(resultsPage.getByRole('combobox', {name: 'Search', exact: true})).toHaveValue(
        query,
      );
      if (popup) await resultsPage.close();
      await page.close();
    }
  });
}

for (const action of ['Enter', 'search button']) {
  test(`a different suggestion submits with ${action} while the first response is pending`, async ({
    extension: {context, worker, app},
  }) => {
    await worker.evaluate(() =>
      chrome.storage.sync.set({
        profiles: [{id: 'books', name: 'Books', trackers: [{id: 'booktracker'}]}],
      }),
    );
    const original = 'Sintel';
    const alternate = 'Sintel alternate';
    const searchUrl = (query: string) => `${app}#/search?${new URLSearchParams({query})}`;
    const firstRequest = Promise.withResolvers<void>();
    const firstResponse = Promise.withResolvers<void>();
    await context.route('https://booktracker.org/tracker.php?**', async (route) => {
      const query = new URL(route.request().url()).searchParams.get('nm');
      if (query === original) {
        firstRequest.resolve();
        await firstResponse.promise;
      }
      await route.fulfill({
        contentType: 'text/html',
        body:
          '<table id="tor-tbl"><tr><td></td><td></td><td></td>' +
          `<td class="row4 med tLeft"><a href="/viewtopic.php?t=1">${query} release</a></td>` +
          '</tr></table>',
      });
    });
    await context.route('https://suggestqueries.google.com/**', (route) =>
      route.fulfill({json: [original, [original, alternate]]}),
    );

    const page = await context.newPage();
    try {
      await page.goto(searchUrl(original));
      await firstRequest.promise;
      const input = page.getByRole('combobox', {name: 'Search', exact: true});
      const button = page.getByRole('button', {name: 'Search', exact: true});
      const currentOption = page.getByRole('option', {name: original, exact: true});
      await input.click();
      await expect(currentOption).toBeVisible();
      await input.press('ArrowDown');
      await expect(currentOption).toHaveAttribute('aria-selected', 'true');
      await expect(button).toBeDisabled();
      await input.press('Enter');
      await button.click({force: true});
      await expect(page).toHaveURL(searchUrl(original));
      await expect(currentOption).toBeVisible();

      await input.press('ArrowDown');
      await expect(input).toHaveValue(alternate);
      if (action === 'Enter') await input.press('Enter');
      else {
        await expect(button).toBeEnabled();
        await button.click();
      }
      await expect(page).toHaveURL(searchUrl(alternate));
      await expect(page.getByRole('link', {name: `${alternate} release`})).toBeVisible();
    } finally {
      firstResponse.resolve();
    }
  });
}

test('search terms match both spellings and highlight the original title', async ({extension}) => {
  const {context, worker, app} = extension;
  const titles = ['Ежик Синий [1080p]', 'Ёжик Синии [1080p]', '🎬 Ёжики Синиики (ЕЖИК СИНИЙ)'];
  const queries = ['Ёжик Синии', 'Ежик Синий'];
  const requested: (string | null)[] = [];
  await worker.evaluate(() =>
    chrome.storage.sync.set({
      profiles: [{id: 'books', name: 'Books', trackers: [{id: 'booktracker'}]}],
    }),
  );
  await context.route('https://booktracker.org/tracker.php?**', (route) => {
    requested.push(new URL(route.request().url()).searchParams.get('nm'));
    return route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: `<table id="tor-tbl"><tbody>${titles
        .map(
          (title, index) =>
            '<tr><td></td><td></td><td></td>' +
            `<td class="row4 med tLeft"><a href="/viewtopic.php?t=${index}">${title}</a></td></tr>`,
        )
        .join('')}</tbody></table>`,
    });
  });

  const page = await context.newPage();
  const highlights = [
    ['Ежик', 'Синий'],
    ['Ёжик', 'Синии'],
    ['ЕЖИК', 'СИНИЙ'],
  ];
  for (const query of queries) {
    await page.goto(`${app}#/search?${new URLSearchParams({query})}`);
    for (const [index, title] of titles.entries()) {
      const result = page.getByRole('link', {name: title, exact: true});
      await expect(result.locator('b')).toHaveText(highlights[index]);
    }
    const score = (title: string) =>
      page
        .getByRole('row')
        .filter({has: page.getByRole('link', {name: title, exact: true})})
        .locator('.quality_value');
    await expect(score(titles[1])).toHaveText(await score(titles[0]).innerText());
  }
  expect(requested).toEqual(queries);
});

test('the date filter keeps its selected period when a new search replaces the results', async ({
  extension: {context, worker, app},
}) => {
  await worker.evaluate(() =>
    chrome.storage.sync.set({
      profiles: [{id: 'books', name: 'Books', trackers: [{id: 'booktracker'}]}],
    }),
  );
  await context.route('https://booktracker.org/tracker.php?**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body:
        '<table id="tor-tbl"><tr><td></td><td></td><td></td>' +
        '<td class="row4 med tLeft"><a href="/viewtopic.php?t=42">Release without a date</a></td>' +
        '</tr></table>',
    }),
  );
  const page = await context.newPage();
  await page.goto(app + '#/search?query=first');
  const result = page.getByRole('link', {name: 'Release without a date'});
  await expect(result).toBeVisible();
  const date = page.getByRole('combobox', {name: 'Date added'});
  await date.selectOption('86400');
  await expect(result).toHaveCount(0);
  await page.getByRole('link', {name: 'History', exact: true}).click();
  await expect(date).toHaveCount(0);
  const search = page.getByRole('combobox', {name: 'Search', exact: true});
  await search.fill('second');
  await search.press('Enter');
  await expect(page).toHaveURL(app + '#/search?query=second');
  await expect(page.getByText('No results match the current filters.')).toBeVisible();
  await expect(date).toHaveValue('86400');
  await date.selectOption('0');
  await expect(result).toBeVisible();
});
