import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
  type QualityConfig,
  defaults,
  parseQualityImport,
  planQualityImport,
} from '../qualityConfig.ts';
import {calculateQuality} from '../qualityModel.ts';

import weights from '../qualityWeights.json' with {type: 'json'};

const now = 1794733200;
const gib = 2 ** 30;

test('the shipped model ranks comparable releases even with category grouping turned off', () => {
  const config = {...defaults, ...parseQualityImport(JSON.stringify(weights))};
  const rank = (title: string, size: number, define: boolean) =>
    calculateQuality(
      config,
      {
        title,
        size,
        categoryTitle: 'Зарубежное кино (HD Video)',
        relevance: 70,
      },
      now,
      define,
    );
  const hd = rank('Sintel 2160p Blu-ray x265 DTS', 24 * gib, true);
  const sd = rank('Sintel 720p WEBRip H264', 2 * gib, true);
  assert.equal(hd.categoryId, 3);
  assert.equal(sd.categoryId, hd.categoryId);
  assert.ok(hd.quality > sd.quality);

  const withoutGrouping = rank('Sintel 2160p Blu-ray x265 DTS', 24 * gib, false);
  assert.equal(withoutGrouping.categoryId, -1);
  assert.equal(withoutGrouping.quality, hd.quality);
});

test('a single category rule competes with zero scores for categories without a match', () => {
  const release = {title: 'Sample episode', relevance: 80};
  const rank = (points: number, relevance = release.relevance) =>
    calculateQuality(
      {
        ...defaults,
        categoryMargin: 20,
        rules: [
          {
            patterns: [{text: 'episode'}],
            weights: [
              {criterion: 'category', categoryId: 0, points},
              {criterion: 'video', categoryId: 0, points: 45},
            ],
          },
        ],
      },
      {...release, relevance},
      now,
      true,
    );
  const classified = rank(20);
  assert.equal(classified.categoryId, 0);
  assert.equal(classified.quality, 125);
  assert.equal(rank(20, 40).quality, 85);
  assert.equal(rank(19).categoryId, -1);
  assert.equal(rank(-30).quality, release.relevance);
});

test('ambiguous video titles abstain and clear tracker rubrics distinguish films, anime and cartoons', () => {
  const rank = (title: string, categoryTitle?: string) =>
    calculateQuality(
      {...defaults, categoryMargin: 20},
      {title, categoryTitle, size: 2 * gib, relevance: 0},
      now,
      true,
    ).categoryId;

  const film = 'xXx: Return of Xander Cage 2160p HDRip';
  assert.equal(rank(film), -1);
  assert.equal(rank(film, 'Зарубежное кино (HD Video)'), 3);
  assert.equal(rank(film, 'Зарубежные фильмы и сериалы (HD)'), -1);
  assert.equal(rank('Sample 2160p 18+ HDRip'), -1);
  assert.equal(rank('Битва за Москву (1985) BDRemux 1080p | JPN Transfer'), -1);
  assert.equal(rank('Sample [OVA] [JAP+Sub] BDRip 1080p'), 7);
  assert.equal(rank('Sample 1080p WEB-DL', 'Мультфильмы'), 4);
  assert.equal(rank('Sample 1080p WEB-DL', 'Аниме (HD)'), 7);
});

test('range boundaries, category inference and date, seeds and peers remain independent', () => {
  const config: QualityConfig = {
    ...defaults,
    categoryMargin: 20,
    includeDate: true,
    seedMin: 2,
    seedPoints: -2.25,
    leechPoints: 4.25,
    rules: [
      {
        patterns: [{text: 'sintel'}],
        weights: [
          {criterion: 'category', categoryId: 3, points: 35},
          {criterion: 'category', categoryId: 4, points: 3},
        ],
      },
      {
        patterns: [{text: '^', regex: true}],
        weights: [{criterion: 'size', points: 1.75}],
        minBytes: 100,
        maxBytes: 200,
      },
      {
        patterns: [{text: '^', regex: true}],
        weights: [{criterion: 'date', points: -3}],
        maxAgeDays: 7,
      },
    ],
  };
  const input = {
    title: 'Sintel',
    size: 100,
    date: now - 86400,
    seeds: 2,
    peers: 1,
    relevance: 60,
  };
  const rank = (config: QualityConfig, inputValues = input, define = true) =>
    calculateQuality(config, inputValues, now, define);
  assert.equal(rank(config).quality, 59);
  assert.equal(rank({...config, includeSeeds: true}).quality, 57);
  assert.equal(rank({...config, includeLeeches: true}).quality, 63);
  assert.equal(rank({...config, includeDate: false}).quality, 62);
  assert.equal(rank(config, {...input, size: 200}).quality, 57);
  assert.equal(rank(config, {...input, date: now - 7 * 86400}).quality, 62);
  assert.equal(rank(config).categoryId, 3);
  assert.equal(rank(config, input, false).categoryId, -1);
  assert.equal(rank(config, {...input, title: 'Some release', size: 0, date: 0}).score.value, 0);
});

test('JSON validation names the responsible field and rejects unbounded regexes', () => {
  assert.throws(() => parseQualityImport('{"version":2,"rules":[]}'), /version: version/);
  const rule = (text: string) =>
    JSON.stringify({
      version: 1,
      rules: [{patterns: [{text, regex: true}], weights: [{criterion: 'video', points: 2}]}],
    });
  assert.throws(() => parseQualityImport(rule('[')), /rules\[0\]\.patterns\[0\]\.text: regex/);
  assert.throws(() => parseQualityImport(rule('(a+)+$')), /complexity/);
});

test('merge updates matching weights in place and replace round-trips all rule semantics', () => {
  const pattern = {
    patterns: [{text: 'Foo'}, {text: 'bar'}],
    weights: [{criterion: 'video' as const, points: 3}],
    minBytes: 1,
  };
  const base = {...defaults, rules: [pattern, {...pattern, minBytes: 2}]};
  const update = {
    ...pattern,
    patterns: [{text: 'BAR'}, {text: 'FOO'}],
    weights: [{criterion: 'video' as const, points: -0.5}],
  };
  const added = {...pattern, minBytes: 3};
  const plan = planQualityImport(
    base,
    JSON.stringify({version: 1, rules: [update, added]}),
    'merge',
  );
  assert.deepEqual(
    plan.config.rules.map(({minBytes}) => minBytes),
    [1, 2, 3],
  );
  assert.equal(plan.config.rules[0].weights[0].points, -0.5);
  assert.deepEqual(plan.config.rules[0].patterns, pattern.patterns);
  assert.deepEqual(
    planQualityImport(base, JSON.stringify(plan.config), 'replace').config,
    plan.config,
  );
});
