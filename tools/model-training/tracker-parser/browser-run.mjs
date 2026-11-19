import {chromium} from '@playwright/test';
import {readFile, writeFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const [action, inputFile, outputFile, holdoutFile] = process.argv.slice(2);
if (!['prepare', 'verify'].includes(action) || !inputFile || !outputFile) {
  throw new Error(
    'Usage: node browser-run.mjs prepare|verify manifest.json output.json [holdout-models.json]',
  );
}

const manifest = JSON.parse(await readFile(inputFile, 'utf8'));
const relativeToManifest = (file) => resolve(dirname(inputFile), file);
const {outputFiles} = await build({
  stdin: {
    contents: [
      "export {inspectPage, predictPage} from './parser-model.ts';",
      action === 'verify'
        ? "export {default as Tracker} from '../../../src/sandbox/exKitTracker.ts';"
        : '',
    ].join('\n'),
    resolveDir: fileURLToPath(new URL('.', import.meta.url)),
  },
  bundle: true,
  format: 'esm',
  platform: 'browser',
  write: false,
});
const modelModule =
  'data:text/javascript;base64,' + Buffer.from(outputFiles[0].contents).toString('base64');
const browser = await chromium.launch({
  executablePath: process.env.TSEARCH_CHROME,
  headless: true,
});
try {
  const page = await browser.newPage();
  await page.route(/https?:/, (route) => route.abort());
  const model =
    action === 'verify'
      ? JSON.parse(await readFile(relativeToManifest(manifest.model), 'utf8'))
      : null;
  const holdouts = holdoutFile ? JSON.parse(await readFile(holdoutFile, 'utf8')) : {};
  const results = [];
  for (const sample of manifest.samples) {
    const html = await readFile(relativeToManifest(sample.html), 'utf8');
    const output = await page.evaluate(
      async ({modelModule, sample, html, model}) => {
        const {inspectPage, predictPage, Tracker} = await import(modelModule);
        if (!model) return inspectPage(html, sample.url, sample.status);
        const start = performance.now();
        const predicted = predictPage(html, sample.url, model, sample.status);
        const inferenceMs = performance.now() - start;
        if (predicted.status !== 'results') return {...predicted, inferenceMs};
        const tracker = new Tracker();
        await tracker.init(predicted.definition);
        const response = {
          body: html,
          url: sample.url,
          statusCode: sample.status ?? 200,
          headers: {},
        };
        const {results} = tracker.parseResponse({tracker, response}, response);
        for (const [field, expected] of Object.entries(sample.expectedFirstRow ?? {})) {
          if (results[0]?.[field] !== expected) {
            throw new Error(`${sample.site}: first row has an unexpected value for ${field}`);
          }
        }
        const fields = Object.keys(predicted.definition.selectors).filter(
          (field) => !['row', 'skipFromStart', 'skipFromEnd', 'nextPageUrl'].includes(field),
        );
        const coverage = Object.fromEntries(
          fields.map((field) => [
            field,
            results.filter((row) =>
              typeof row[field] === 'number'
                ? Number.isFinite(row[field]) && row[field] !== -1
                : !!row[field],
            ).length,
          ]),
        );
        return {...predicted, inferenceMs, parsedRows: results.length, coverage};
      },
      {modelModule, sample, html, model: holdouts[sample.site] ?? model},
    );
    if (action === 'prepare') {
      if (!sample.columns) continue;
      if (output.status !== 'results') {
        throw new Error(`${sample.site}: labeled page returned ${output.status}`);
      }
      const group = [...output.groups].sort((a, b) => b.count - a.count)[0];
      for (const [field, column] of Object.entries(sample.columns)) {
        if (!group.candidates[field]?.some((candidate) => candidate.column === column - 1)) {
          throw new Error(`${sample.site}: no candidate for ${field} in column ${column}`);
        }
      }
      results.push({
        site: sample.site,
        columns: sample.columns,
        detailSelector: group.detail?.selector,
        features: Object.fromEntries(
          Object.entries(group.candidates).map(([field, candidates]) => [
            field,
            candidates.map(({column, rule, features}) => ({
              column: column + 1,
              selector: rule.selector,
              ruleKey: JSON.stringify(rule),
              features,
            })),
          ]),
        ),
      });
    } else {
      if (sample.expected && output.status !== sample.expected) {
        throw new Error(`${sample.site}: expected ${sample.expected}, got ${output.status}`);
      }
      if (output.status === 'results' && output.parsedRows !== output.rowCount) {
        throw new Error(
          `${sample.site}: parser returned ${output.parsedRows}/${output.rowCount} rows`,
        );
      }
      if (sample.expectedRowCount !== undefined && output.parsedRows !== sample.expectedRowCount) {
        throw new Error(
          `${sample.site}: expected ${sample.expectedRowCount} parsed rows, got ${output.parsedRows}`,
        );
      }
      results.push({site: sample.site, ...output});
    }
  }
  await writeFile(outputFile, JSON.stringify(results, null, 2) + '\n', {mode: 0o600});
  console.log(`Processed ${results.length} samples`);
} finally {
  await browser.close();
}
