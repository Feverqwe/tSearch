import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {defaults, validateQualityImport} from '../../../src/tools/qualityConfig.ts';
import {calculateQuality} from '../../../src/tools/qualityModel.ts';
import rate from '../../../src/tools/rate.ts';

const [dataPath, candidatePath, reportPath, baselinePath] = process.argv.slice(2);
if (!reportPath) {
  throw new Error('Usage: node verify-retraining.mjs DATASET CANDIDATE REPORT [BASELINE_WEIGHTS]');
}

const dataset = JSON.parse(
  execFileSync(
    'python3',
    [
      '-c',
      `
import json, pathlib, sys
from train import load, group_bucket, comparison_pairs, technical_pairs
rows = load([pathlib.Path(sys.argv[1])])
heldout = [row for row in rows if group_bucket(row) < 2]
calibration = [row for row in rows if group_bucket(row) == 2]
def key(row):
    return (row['source'], row['topicId'])
print(json.dumps({
    'test': heldout, 'calibration': calibration,
    'technical': [[key(a), key(b)] for a, b, _ in technical_pairs(heldout)],
    'observed': [[key(a), key(b)] for a, b in comparison_pairs(heldout)],
}, ensure_ascii=False))
`,
      resolve(dataPath),
    ],
    {
      cwd: import.meta.dirname,
      env: {...process.env, PYTHONDONTWRITEBYTECODE: '1'},
      maxBuffer: 64 * 1024 * 1024,
    },
  ),
);

function settings(path) {
  return {...defaults, ...validateQualityImport(JSON.parse(readFileSync(path, 'utf8')))};
}

const previous = baselinePath ? settings(baselinePath) : defaults;
const candidate = settings(candidatePath);
const scheme = rate.getScheme('');

const inputFor = (row, withRubric, withDate = false) => {
  return {
    title: row.title,
    categoryTitle: withRubric ? row.forumTitle : undefined,
    size: row.sizeBytes ?? undefined,
    date: withDate ? (row.postedAt ?? undefined) : undefined,
    relevance: rate.getRate(row, scheme).sum,
  };
};
const id = (row) => [row.source, row.topicId].join(':');
const classify = (config, samples, withRubric, categoryMargin = config.categoryMargin) => {
  const matrix = Array.from({length: 12}, () => ({
    rows: 0,
    predicted: 0,
    correct: 0,
    predictedFromFilm: 0,
  }));
  const bySource = Object.create(null);
  const byRelease = new Map();
  const ageOn = new Map();
  const settings = {...config, categoryMargin};
  for (const row of samples) {
    const input = inputFor(row, withRubric);
    const now = Date.parse(row.capturedAt) / 1000;
    const prediction = calculateQuality(settings, input, now, true);
    const dated = calculateQuality(
      {...settings, includeDate: true},
      {...input, date: row.postedAt ?? undefined},
      now,
      true,
    );
    byRelease.set(id(row), prediction.quality);
    ageOn.set(id(row), dated.quality);

    const actual = row.categoryId;
    const inferred = prediction.categoryId;
    matrix[actual].rows++;
    bySource[row.source] ??= {rows: 0, predicted: 0, correct: 0};
    const source = bySource[row.source];
    source.rows++;
    if (inferred < 0) continue;
    matrix[inferred].predicted++;
    source.predicted++;
    if (actual === inferred) {
      source.correct++;
      matrix[inferred].correct++;
    } else if (actual === 3) matrix[inferred].predictedFromFilm++;
  }
  const totals = {rows: samples.length, predicted: 0, correct: 0};
  for (const category of matrix) {
    totals.predicted += category.predicted;
    totals.correct += category.correct;
  }
  return {
    classification: {
      ...totals,
      precision: totals.predicted ? totals.correct / totals.predicted : 0,
      coverage: totals.rows ? totals.predicted / totals.rows : null,
      byCategory: matrix,
      bySource,
    },
    byRelease,
    ageOn,
  };
};
const comparePairs = (scores, pairs) => {
  let wins = 0;
  let ties = 0;
  for (const [a, b] of pairs) {
    const difference = scores.get(a.join(':')) - scores.get(b.join(':'));
    if (difference > 0) wins++;
    else if (difference === 0) ties++;
  }
  return {
    pairs: pairs.length,
    wins,
    ties,
    accuracy: pairs.length ? (wins + ties * 0.5) / pairs.length : null,
  };
};

const output = {
  baseline: {},
  candidate: {},
  calibration: {},
  candidateMargin: candidate.categoryMargin,
};
for (const [key, model] of [
  ['baseline', previous],
  ['candidate', candidate],
]) {
  for (const [mode, useRubric] of [
    ['titleAndSize', false],
    ['withAvailableRubrics', true],
  ]) {
    const result = classify(model, dataset.test, useRubric);
    output[key][mode] = {
      ...result.classification,
      technical: comparePairs(result.byRelease, dataset.technical),
      observed: comparePairs(result.byRelease, dataset.observed),
      observedWithDate: comparePairs(result.ageOn, dataset.observed),
    };
  }
}
for (const margin of new Set([candidate.categoryMargin, 55, 65])) {
  output.calibration[margin] = classify(
    candidate,
    dataset.calibration,
    true,
    margin,
  ).classification;
}
writeFileSync(reportPath, JSON.stringify(output, null, 2) + '\n');
for (const [variant, report] of [
  ['baseline', output.baseline],
  ['candidate', output.candidate],
]) {
  for (const [mode, result] of Object.entries(report)) {
    const {precision, coverage, technical, observed, byCategory} = result;
    console.log(variant, mode, {
      precision,
      coverage,
      technical: technical.accuracy,
      observed: observed.accuracy,
      sensitive: [4, 7, 10].map((category) => byCategory[category]),
    });
  }
}
