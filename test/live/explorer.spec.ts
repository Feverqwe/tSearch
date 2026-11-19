import {expect, test as base, type BrowserContext, type Page} from '@playwright/test';
import {launchLiveBrowser, liveExtensionHome} from './profile.ts';

const test = base.extend<{live: {page: Page}}, {liveContext: BrowserContext}>({
  liveContext: [
    // Playwright requires an object pattern for fixture dependencies.
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const context = await launchLiveBrowser(workerInfo.project.use.headless ?? true);
      try {
        await use(context);
      } finally {
        await context.close();
      }
    },
    {scope: 'worker'},
  ],
  live: async ({liveContext}, use) => {
    const page = await liveContext.newPage();
    try {
      await page.goto(await liveExtensionHome(liveContext));
      await use({page});
    } finally {
      await page.close();
    }
  },
});

const sections = [
  ['kpInCinema', 'www.kinopoisk.ru', '/lists/movies/movies-in-cinema/'],
  ['kpPopular', 'www.kinopoisk.ru', '/popular/day/now/perpage/200/'],
  ['kpSeries', 'www.kinopoisk.ru', '/lists/movies/'],
  ['imdbInCinema', 'www.imdb.com', '/chart/boxoffice/'],
  ['imdbPopular', 'www.imdb.com', '/chart/moviemeter/'],
  ['imdbSeries', 'www.imdb.com', '/chart/tvmeter/'],
  ['tmdbInCinema', 'www.themoviedb.org', '/movie/now-playing'],
  ['tmdbPopular', 'www.themoviedb.org', '/movie'],
  ['tmdbSeries', 'www.themoviedb.org', '/tv'],
  ['ggGamesNew', 'gameguru.ru', '/calendar/'],
  ['ggGamesTop', 'gameguru.ru', '/games/platform_pc/'],
] as const;

for (const [id, hostname, pathname] of sections) {
  test(`live explorer: ${id}`, async ({live: {page}}) => {
    const section = page.locator(`[data-id="${id}"]`);
    await section.getByTitle('Customize').click();
    const [response] = await Promise.all([
      page.waitForResponse(
        (entry) => {
          const target = new URL(entry.url());
          return (
            target.hostname === hostname &&
            (id === 'ggGamesNew'
              ? target.pathname.startsWith(pathname)
              : target.pathname === pathname)
          );
        },
        {timeout: 20_000},
      ),
      section.getByTitle('Update').click(),
    ]);
    expect(response.ok(), `${hostname}${pathname} returned HTTP ${response.status()}`).toBe(true);
    await expect(section.locator('.poster').first()).toBeVisible({timeout: 30_000});
  });
}

test('live explorer: signed-in Kinopoisk favorites', async ({live: {page}}) => {
  test.skip(process.env.TSEARCH_CHECK_KP_FAVORITES !== '1', 'Requires a signed-in test profile');
  const section = page.locator('[data-id="kpFavorites"]');
  await section.getByTitle('Update').click();
  await expect(
    section.locator('.poster').first(),
    'Use a signed-in test profile and a nonempty Kinopoisk folder',
  ).toBeVisible({timeout: 30_000});
  await expect(section).not.toHaveClass(/section-login/);
});
