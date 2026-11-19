import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {
  prepareTitleQuery,
  titleMatchFeatures,
  titleMatchFeatureNames,
} from '../../../src/tools/titleMatchFeatures.ts';

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error('Usage: node prepare.mjs INPUT.jsonl FEATURES.json');
}
const rows = readFileSync(inputPath, 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line));
const buckets = new Map();
const examples = [];
let sourceTitles = 0;
const works = new Set();
for (const row of rows) {
  // Use a title alias before the director, format and release metadata.
  const alias = row.title
    .split(/[\[(]/u, 1)[0]
    .split(' / ', 1)[0]
    .trim()
    .replace(/\s+[-–—]\s+\d{4}.*$/u, '');
  const q = prepareTitleQuery(alias);
  if (q.words.length < 2 || q.words.length > 12) continue;
  const year = row.title.match(/[\[(](?:[^\p{L}\p{N}]*)(19\d{2}|20\d{2})(?=[^\d])/u)?.[1];
  const query = [alias, year].filter(Boolean).join(' ');
  const key = q.words.join(' ');
  const bucket = createHash('sha256').update(key).digest()[0] % 10;
  const group = bucket < 2 ? 'test' : bucket === 2 ? 'calibration' : 'train';
  const make = (title, label, kind) =>
    examples.push({
      x: titleMatchFeatures(prepareTitleQuery(query), title).values,
      y: label,
      group,
      kind,
    });
  make(row.title, 1, 'alias');
  make(row.title.toLowerCase(), 1, 'case');
  make(row.title.replaceAll(/[.,:!–—-]/gu, ' '), 1, 'punctuation');
  const reversed = q.words.slice().reverse().join(' ') + (year ? ' (' + year + ')' : '');
  make(
    reversed,
    q.words.every((word, index) => word === q.words.at(-index - 1)) ? 1 : 0.65,
    'reversed',
  );
  if (year) {
    make(row.title.replace(year, String(+year - 1)), 0, 'wrongYear');
    make(row.title.replace(year, ''), 0.65, 'missingYear');
  }
  const other = buckets.get(row.categoryId);
  if (other && titleMatchFeatures(prepareTitleQuery(query), other).tier < 2)
    make(other, 0, 'otherWork');
  buckets.set(row.categoryId, row.title);
  sourceTitles++;
  works.add(key);
}
writeFileSync(
  outputPath,
  JSON.stringify({
    featureNames: titleMatchFeatureNames,
    rows: examples,
    works: works.size,
    sourceTitles,
  }),
);
console.log({works: works.size, sourceTitles, pairs: examples.length});
