import assert from 'node:assert/strict';
import {test} from 'node:test';

import type {TrackerInference} from '../../tools/trackerInference/index.ts';
import {createCodeDraft, serializeCodeDraft} from '../codeDraft.ts';
import {applyTrackerInference, createBuilderOperation, extractionKey} from '../trackerBuilder.ts';

test('partial inference retains missing rules and metadata from the existing draft', () => {
  const draft = createCodeDraft();
  draft.search.url = 'https://example.test/search?q=%search%';
  draft.description.name = 'Manual name';
  draft.selectors.seeds = {
    selector: '.custom-seeds',
    pipeline: [{name: 'getText'}, {name: 'toInt'}],
  };
  const rules = {
    row: {selector: 'article'},
    title: {selector: 'h2', pipeline: [{name: 'getText'}]},
    url: {selector: 'a', pipeline: [{name: 'getProp', args: ['href']}]},
  };
  const prediction = {
    status: 'results',
    definition: {
      search: {url: 'https://example.test/search?q=example'},
      selectors: rules,
      description: {name: 'Detected name', description: 'Detected description'},
    },
    searchSource: 'unknown',
  } as TrackerInference;
  const applied = applyTrackerInference(draft, prediction);
  assert.deepEqual(applied.selectors.seeds, draft.selectors.seeds);
  assert.deepEqual(applied.selectors.title, rules.title);
  assert.equal(applied.description.name, draft.description.name);
  assert.equal(applied.description.description, 'Detected description');
  assert.deepEqual(applied.search, draft.search);
});

test('superseded work stays obsolete after a newer request starts and completes', async () => {
  const operation = createBuilderOperation();
  const oldJob = operation.start();
  const newJob = operation.start();
  const accepted: string[] = [];
  const report = (job: typeof oldJob, result: string) => {
    if (job.isCurrent()) accepted.push(result);
    job.finish();
  };
  await Promise.resolve().then(() => report(oldJob, 'old'));
  assert.ok(oldJob.signal.aborted);
  assert.ok(newJob.isCurrent());
  report(newJob, 'new');
  assert.deepEqual(accepted, ['new']);
  assert.equal(oldJob.isCurrent(), false);
});

test('metadata, publication and legacy base URL edits change JSON without invalidating extraction', () => {
  const draft = createCodeDraft();
  const updated = {
    ...draft,
    search: {...draft.search, baseUrl: 'https://legacy.example.test/'},
    description: {
      ...draft.description,
      name: 'Updated',
      downloadUrl: 'https://example.test/trackers/one.json',
    },
  };
  assert.equal(extractionKey(draft, 'linux'), extractionKey(updated, 'linux'));
  assert.notEqual(serializeCodeDraft(draft), serializeCodeDraft(updated));
  const throughTab = {
    ...updated,
    description: {...updated.description, requestMode: 'tab' as const},
  };
  assert.notEqual(extractionKey(updated, 'linux'), extractionKey(throughTab, 'linux'));
  assert.notEqual(extractionKey(updated, 'linux'), extractionKey(updated, 'bsd'));
});
