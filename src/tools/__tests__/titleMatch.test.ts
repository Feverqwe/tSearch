import assert from 'node:assert/strict';
import {test} from 'node:test';

import {evaluateTitleMatch} from '../titleMatch.ts';
import {prepareTitleQuery} from '../titleMatchFeatures.ts';
import sortResults from '../sortResults.ts';

const match = (query: string, title: string) => evaluateTitleMatch(prepareTitleQuery(query), title);

test('case, Unicode composition, punctuation and known Russian letter variants keep the same match', () => {
  const original = match('Big Buck Bunny', 'Big Buck Bunny (2008) 1080p');
  assert.deepEqual(match('big buck bunny', 'BIG BUCK BUNNY (2008) 1080p'), original);
  assert.deepEqual(match('BIG BUCK BUNNY', 'Big-Buck: Bunny (2008) 1080p'), original);
  assert.deepEqual(match('Амели', 'Амели'), match('Амели', 'Амели'.normalize('NFD')));
  assert.deepEqual(match('Соловей', 'Соловей'), match('соловеи', 'СОЛОВЕИ'));
});

test('word boundaries and repeated query tokens determine coverage', () => {
  assert.equal(match('It', 'Little Women').coverage, 0);
  assert.equal(match('Игра Игра', 'Игра (2020)').coverage, 0.5);
  assert.equal(match('Игра Игра', 'Игра Игра (2020)').coverage, 1);
  assert.ok(
    match('Big Buck Bunny', 'Big Buck Bunny').score >
      match('Big Buck Bunny', 'Bunny Buck Big').score,
  );
  assert.equal(match('😃', 'Sample').score, 0);
  assert.equal(match('', 'Sample').tier, 3);
});

test('the requested release year distinguishes conflicts, unknown dates and matches', () => {
  const query = 'Dune 2021';
  const correct = match(query, 'Dune / Дюна (2021) WEBRip 720p');
  const wrong = match(query, 'Dune (1984) BDRemux 2160p [Remaster 2021]');
  const unknown = match(query, 'Dune 1080p');
  assert.ok(correct.tier > unknown.tier);
  assert.ok(unknown.tier > wrong.tier);
  assert.equal(
    match('2001 A Space Odyssey 1968', '2001: A Space Odyssey (1968)').tier,
    correct.tier,
  );
  assert.equal(match('Blade Runner 2049', 'Blade Runner 2049 (2017)').tier, correct.tier);
  assert.equal(match('1984', '1984 (1984)').coverage, 1);
  assert.ok(
    match('Dune 2021 1080p', 'Dune (2021) 1080p').tier >
      match('Dune 2021 1080p', 'Dune (1984) 1080p [Remaster 2021]').tier,
  );
});

test('quality sorting keeps a confirmed work above a conflicting year regardless of release bonuses', () => {
  const query = 'Dune 2021';
  const rows = [
    {
      id: 'wrong',
      quality: 9000,
      titleMatchTier: match(query, 'Dune (1984) 2160p').tier,
      seeds: 900,
    },
    {id: 'correct', quality: 300, titleMatchTier: match(query, 'Dune (2021) 720p').tier, seeds: 1},
    {id: 'unknown', quality: 500, titleMatchTier: match(query, 'Dune 1080p').tier, seeds: 40},
    {
      id: 'correct-hd',
      quality: 400,
      titleMatchTier: match(query, 'Dune (2021) 1080p').tier,
      seeds: 10,
    },
  ];
  assert.deepEqual(
    sortResults([...rows], [{by: 'quality', direction: 0}]).map(({id}) => id),
    ['correct-hd', 'correct', 'unknown', 'wrong'],
  );
  assert.deepEqual(
    sortResults([...rows], [{by: 'quality', direction: 1}]).map(({id}) => id),
    ['wrong', 'unknown', 'correct', 'correct-hd'],
  );
  assert.equal(sortResults([...rows], [{by: 'seeds', direction: 0}])[0].id, 'wrong');
});

test('release years remain constraints when the query contains extra format or language terms', () => {
  for (const suffix of ['HDR', 'Blu-ray', 'HDR Blu-ray', 'Dolby Vision', 'DTS-HD MA', 'RUS']) {
    const query = 'Dune 2021 ' + suffix;
    const correct = match(query, 'Dune (2021) ' + suffix);
    const wrong = match(query, 'Dune (1984) ' + suffix + ' [Remaster 2021]');
    const unknown = match(query, 'Dune ' + suffix);
    assert.ok(correct.tier > unknown.tier, query);
    assert.ok(unknown.tier > wrong.tier, query);
    assert.ok(correct.score > wrong.score, query);
  }
});

test('a year appearing in a numeric work name consumes only its own occurrence', () => {
  const query = '1984 1984';
  const correct = match(query, '1984 (1984) Blu-ray');
  const missing = match(query, '1984 Blu-ray');
  const wrong = match(query, '1984 (1956) Blu-ray [Remaster 1984]');
  assert.equal(correct.tier, match('Dune 2021', 'Dune (2021) Blu-ray').tier);
  assert.ok(correct.tier > missing.tier);
  assert.ok(missing.tier > wrong.tier);
  assert.ok(correct.score > missing.score);
  assert.ok(
    match('1984 1984 1984', '1984 1984 (1984) Blu-ray').tier >
      match('1984 1984 1984', '1984 1984 Blu-ray').tier,
  );
});

test('repeated numeric title aliases do not become conflicting release years', () => {
  for (const [name, year] of [
    ['1917', '2019'],
    ['1984', '1984'],
  ]) {
    const query = `${name} ${year}`;
    const correct = match(query, `${name} (${year}) Blu-ray`);
    for (const title of [
      `${name} / ${name} (${year}) UHD BDRemux 2160p`,
      `${name} / ${name} / ${year} / Blu-Ray Remux (2160p)`,
      `${name} / ${name} (Director / Director) [${year}, UHD BDRemux]`,
    ]) {
      assert.deepEqual(match(query, title), correct, title);
    }
    assert.ok(match(query, `${name} / ${name} Blu-ray`).tier < correct.tier);
    assert.ok(
      match(query, `${name} / ${name} (1956) Blu-ray [Remaster ${year}]`).tier <
        match(query, `${name} / ${name} Blu-ray`).tier,
    );
  }
});

test('frame dimensions never supply a release year regardless of spacing or separator', () => {
  const query = 'Dune 2021';
  const missing = match(query, 'Dune 1080p');
  for (const dimensions of [
    '1920x1080',
    '1920 x 1080',
    '1920 × 1080',
    '1920 Х 1080',
    '1920*1080p',
  ]) {
    assert.deepEqual(match(query, 'Dune ' + dimensions), missing, dimensions);
    assert.deepEqual(
      match(query, 'Dune ' + dimensions + ' (2021)'),
      match(query, 'Dune (2021) 1080p'),
      dimensions,
    );
    assert.ok(match(query, 'Dune ' + dimensions + ' (1984)').tier < missing.tier, dimensions);
  }
  assert.equal(
    match('Dune 1920 x 1080', 'Dune 1920 x 1080 [Remaster 2021]').tier,
    match('Dune', 'Dune').tier,
  );
});
