import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {build} from 'esbuild';
import {chromium} from '@playwright/test';

const [outputPath, manifestPath] = process.argv.slice(2);
if (!outputPath) {
  throw new Error('Usage: node prepare.mjs OUTPUT_DIRECTORY [MANIFEST.json]');
}
const output = resolve(outputPath);
const real = [];
if (manifestPath) {
  const {samples} = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const entry of samples) {
    if (!['train', 'validation'].includes(entry.split)) {
      throw new Error(`Choose a train or validation split for ${entry.site}`);
    }
    real.push({
      site: entry.site,
      url: entry.url,
      html: await readFile(resolve(dirname(manifestPath), entry.html), 'utf8'),
      expected: entry.expected,
      split: entry.split,
    });
  }
}

const {outputFiles} = await build({
  stdin: {
    contents: "export * from './src/tools/trackerInference/page-candidates.ts';",
    resolveDir: resolve(import.meta.dirname, '../../../..'),
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
});
const module =
  'data:text/javascript;base64,' + Buffer.from(outputFiles[0].contents).toString('base64');
const browser = await chromium.launch({executablePath: process.env.TSEARCH_CHROME, headless: true});
try {
  const page = await browser.newPage();
  await page.route(/https?:/, (route) => route.abort());
  const data = await page.evaluate(
    async ({module, real}) => {
      const {inspectPageDetails, pageElementPath, pageFields} = await import(module);
      function inspect(html, url) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const base = doc.createElement('base');
        base.href = url;
        doc.head.prepend(base);
        return {doc, candidates: inspectPageDetails(doc, new URL(url), pageElementPath)};
      }
      function sample(site, html, url, expected) {
        const {candidates} = inspect(html, url);
        const features = {},
          columns = {},
          coverage = {},
          positives = {};
        let portableNext = [];
        for (const field of pageFields) {
          features[field] = candidates[field].map((candidate, index) => ({
            column: index,
            features: candidate.features,
            portable: !!candidate.rule,
            observable: field !== 'nextPageUrl' || !!candidate.rule || !!candidate.observedNext,
          }));
          const equal = (a, b) => {
            if (a === b) return true;
            if (!a || !b || !field.endsWith('Url')) return false;
            try {
              const left = new URL(a, url),
                right = new URL(b, url);
              left.searchParams.sort();
              right.searchParams.sort();
              return left.href === right.href;
            } catch {
              return false;
            }
          };
          positives[field] = candidates[field].flatMap((candidate, index) =>
            equal(candidate.value, expected[field]) &&
            (field !== 'nextPageUrl' || candidate.rule || candidate.observedNext)
              ? [index]
              : [],
          );
          if (field === 'nextPageUrl')
            portableNext = positives[field].filter((index) => candidates[field][index].rule);
          const index =
            (field === 'nextPageUrl' ? portableNext[0] : undefined) ?? positives[field][0] ?? -1;
          if (index >= 0) columns[field] = index;
          coverage[field] = expected[field] == null || index >= 0;
        }
        return {
          site,
          features,
          columns,
          coverage,
          positives,
          portableNext,
          hasNext: expected.nextPageUrl != null,
        };
      }
      const train = [];
      const validation = [];
      const realValidation = [];
      for (let id = 0; id < 576; id++) {
        const mode = id % 4,
          layout = Math.floor(id / 4) % 6,
          hasLogin = Math.floor(id / 24) % 2 === 0,
          hasDesc = Math.floor(id / 48) % 2 === 0,
          last = Math.floor(id / 96) % 2 === 1;
        const searchPath = id < 384 && id % 4 >= 2 ? '/results' : '/search';
        const url = `https://layout-${id}.example.test${searchPath}?q=release&page=2`;
        const name = 'Tracker ' + id,
          description = 'Catalog of releases ' + id;
        const title =
          mode === 0
            ? `<meta property="og:site_name" content="${name}"><title>Search page</title>`
            : mode === 1
              ? `<meta name="application-name" content="${name}"><title>Search page</title>`
              : mode === 2
                ? `<title>${name}</title>`
                : '';
        const desc = hasDesc
          ? id % 3 === 0
            ? `<meta property="og:description" content="${description}">`
            : `<meta name="description" content="${description}">`
          : '';
        const loginPaths = ['/login', '/signin.php', '/user.php?action=login', '/auth/login'];
        const loginPath = loginPaths[Math.floor(id / 3) % 4];
        const loginLabels = ['Sign in', 'Login', 'Вход', 'Войти', 'Увійти', ''];
        const login = hasLogin
          ? `<a href="${loginPath}">${loginLabels[Math.floor(id / 7) % 6]}</a>`
          : '';
        const wrappedLogin =
          id % 3 === 0 ? `<header>${login}</header>` : id % 3 === 1 ? `<nav>${login}</nav>` : login;
        const labels = ['Next page', 'Далее', 'Следующая', 'Наступна', '›', 'Next'];
        const target = id < 384 && id % 2 ? '/search/releases/3?q=release' : '?q=release&page=3';
        const anchor =
          layout === 0
            ? `<a rel="next" href="${target}">3</a>`
            : layout === 1
              ? `<a href="${target}">${labels[Math.floor(id / 5) % 6]}</a>`
              : layout === 2
                ? `<a class="next" href="${target}"><i></i></a>`
                : layout === 3
                  ? Math.floor(id / 24) % 2
                    ? `<b>Pages: 2 <a href="${target}">3</a></b>`
                    : `<span aria-current="page">2</span><a href="${target}">3</a>`
                  : layout === 4
                    ? `<li class="active"><a href="?q=release&page=2">2</a></li><li><a href="${target}">3</a></li>`
                    : '';
        const head = layout === 5 && !last ? `<link rel="next" href="${target}">` : '';
        const marker = layout === 3 && Math.floor(id / 24) % 2 && id < 384;
        const navClass = marker && Math.floor(id / 48) % 3 !== 0 ? 'browse-controls' : 'pagination';
        const wrapper = marker && Math.floor(id / 48) % 2 ? 'div' : 'nav';
        const nav = `<${wrapper} class="${navClass}"><a href="?q=release&page=1">Previous</a>${last ? '<span class="next disabled">Next</span>' : anchor}<a href="?q=release&page=99">Last</a></${wrapper}>`;
        const html = `<html><head>${title}${desc}${head}<meta name="robots" content="noindex"><meta name="keywords" content="movie,linux"><meta name="viewport" content="width=device-width"></head><body>${wrappedLogin}<header><a href="/auth/logout">Log out</a><a href="/register">Register</a></header><h1>Search results</h1><a href="/torrent/12">Вход в матрицу. Next generation release</a><a href="/download/12">Download</a>${nav}</body></html>`;
        const expected = {
          name: mode === 3 ? new URL(url).hostname : name,
          description: hasDesc ? description : null,
          loginUrl: hasLogin ? new URL(loginPath, url).href : null,
          nextPageUrl: last ? null : new URL(target, url).href,
        };
        (id < 384 ? train : validation).push(sample('synthetic-' + id, html, url, expected));
      }
      for (const {site, html, url, expected, split} of real) {
        const result = sample(site, html, url, expected);
        (split === 'train' ? train : realValidation).push(result);
      }
      return {train, validation, realValidation};
    },
    {module, real},
  );
  await mkdir(output, {recursive: true});
  await writeFile(join(output, 'dataset.json'), JSON.stringify(data));
  console.log(
    JSON.stringify(
      {
        train: data.train.length,
        validation: data.validation.length,
        real: data.realValidation.length,
        candidateCoverage: Object.fromEntries(
          ['name', 'description', 'loginUrl', 'nextPageUrl'].map((field) => [
            field,
            {
              covered: data.realValidation.filter((row) => row.coverage[field]).length,
              total: data.realValidation.length,
            },
          ]),
        ),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
