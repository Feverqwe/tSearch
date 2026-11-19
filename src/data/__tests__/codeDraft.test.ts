import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parseCodeDraft, serializeCodeDraft} from '../codeDraft.ts';

test('a legacy tracker round-trips request options, login and the ordered selector pipeline', () => {
  const old = {
    id: 'fixture',
    search: {
      url: 'https://example.test/?q=%search%',
      originUrl: 'https://example.test/',
      charset: 'windows-1251',
      method: 'POST',
      body: 'query=%search%',
      headers: '{"X-Foo":"bar"}',
    },
    description: {
      name: 'Fixture',
      icon: '#000000',
      version: '1.4',
      updateUrl: 'https://example.test/tracker/legacy.json',
      downloadUrl: 'https://example.test/tracker/full.json',
      requestMode: 'tab',
    },
    auth: {url: 'https://example.test/login', loginForm: {selector: 'form'}},
    selectors: {
      row: {selector: 'article'},
      title: {selector: 'h2', pipeline: [{name: 'getText'}, {name: 'trim'}]},
      url: {selector: 'a', pipeline: [{name: 'getProp', args: ['href']}]},
      categoryTitle: {selector: '.rubric', pipeline: [{name: 'getText'}]},
      categoryUrl: {selector: '.rubric', pipeline: [{name: 'getProp', args: ['href']}]},
      category: {selector: '.obsolete-id'},
      skipFromStart: 1,
    },
  };
  const draft = parseCodeDraft(JSON.stringify(old));
  const saved = JSON.parse(serializeCodeDraft(draft));
  assert.deepEqual(saved.search, old.search);
  assert.deepEqual(saved.auth, old.auth);
  assert.deepEqual(saved.description, old.description);
  assert.deepEqual(saved.selectors.title, old.selectors.title);
  assert.deepEqual(saved.selectors.categoryUrl, old.selectors.categoryUrl);
  assert.equal(saved.selectors.category, undefined);
  assert.deepEqual(parseCodeDraft(JSON.stringify(saved)), draft);
});
