import assert from 'node:assert/strict';
import {test} from 'node:test';
import JSZip from 'jszip';

import {
  BackupWriteError,
  createBackup,
  planBackup,
  writeBackup,
  type BackupArea,
} from '../backupPlan.ts';

function zip(entries: Record<string, unknown>) {
  const archive = new JSZip();
  for (const [name, json] of Object.entries(entries)) archive.file(name, JSON.stringify(json));
  return archive.generateAsync({type: 'uint8array'});
}

test('reads scoped and legacy entries without modifying storage', async () => {
  const history = {Sintel: {query: 'Sintel', time: 12, count: 1, clicks: {}}};
  const files = await zip({
    'history.json': history,
    'local/profileId.json': 'film',
    'profiles.json': [{id: 'film', name: 'Open films', trackers: []}],
    'sync/options.json': {disablePopup: true},
    'sync/unknown.json': {},
  });
  const plan = await planBackup(files);
  assert.deepEqual(plan.local, {history, profileId: 'film'});
  assert.deepEqual(plan.sync, {
    profiles: [{id: 'film', name: 'Open films', trackers: []}],
    options: {disablePopup: true},
  });
  assert.deepEqual(plan.skipped, ['sync/unknown.json']);
});

test('rejects unsanitized paths, malformed JSON, and competing entries before restore', async () => {
  await assert.rejects(planBackup(await zip({'local/../history.json': {}})), /ZIP_INVALID_PATH/);
  await assert.rejects(
    planBackup(await zip({'local/history.json': {}, 'history.json': {}})),
    /ZIP_DUPLICATE_KEY/,
  );
  const bad = new JSZip();
  bad.file('local/history.json', '{invalid');
  await assert.rejects(planBackup(await bad.generateAsync({type: 'uint8array'})), SyntaxError);
});

test('exports a restorable backup despite unsupported storage keys', async () => {
  const archive = await createBackup({
    local: {
      profileId: 'film',
      'legacy/malformed-key': {},
      trackerScriptApprovals: {film: 'digest'},
    },
    sync: {options: {disablePopup: true}},
  });
  assert.deepEqual(await planBackup(archive), {
    local: {profileId: 'film'},
    sync: {options: {disablePopup: true}},
    skipped: [],
  });
  await assert.rejects(
    createBackup({local: {history: 'я'.repeat(12 * 1024 * 1024)}, sync: {}}),
    /ZIP_TOO_LARGE/,
  );
});

test('undoes the whole import when the second area fails', async () => {
  const areas: Record<BackupArea, Record<string, unknown>> = {
    local: {profileId: 'original', trackers: {unrelated: true}},
    sync: {options: {contextMenu: true}},
  };
  let fail = true;
  await assert.rejects(
    writeBackup(
      {local: {profileId: 'new', history: {}}, sync: {options: {contextMenu: false}}, skipped: []},
      {
        async get(area, keys) {
          return Object.fromEntries(
            keys
              .filter((key) => Object.hasOwn(areas[area], key))
              .map((key) => [key, areas[area][key]]),
          );
        },
        async set(area, entries) {
          Object.assign(areas[area], entries);
          if (area === 'sync' && fail) {
            fail = false;
            throw new Error('Intermittent storage failure');
          }
        },
        async remove(area, keys) {
          for (const key of keys) delete areas[area][key];
        },
      },
    ),
    (error) => error instanceof BackupWriteError && !error.retryRestore,
  );
  assert.deepEqual(areas, {
    local: {profileId: 'original', trackers: {unrelated: true}},
    sync: {options: {contextMenu: true}},
  });
});

test('retrying a rollback preserves later changes and restores untouched imported entries', async () => {
  const areas: Record<BackupArea, Record<string, unknown>> = {
    local: {profileId: 'original'},
    sync: {options: {contextMenu: true}},
  };
  const plan = {
    local: {profileId: 'imported', history: {Sintel: {query: 'Sintel', count: 1}}},
    sync: {options: {contextMenu: false}},
    skipped: [],
  };
  let recover: (() => Promise<void>) | undefined;
  let blocked = true;
  await assert.rejects(
    writeBackup(plan, {
      async get(area, keys) {
        return Object.fromEntries(
          keys
            .filter((key) => Object.hasOwn(areas[area], key))
            .map((key) => [key, structuredClone(areas[area][key])]),
        );
      },
      async set(area, entries) {
        if (area === 'local' && blocked && entries.profileId === 'original')
          throw new Error('Rollback failed');
        Object.assign(areas[area], entries);
        if (area === 'sync' && (entries.options as {contextMenu: boolean})?.contextMenu === false)
          throw new Error('Import failed');
      },
      async remove(area, keys) {
        for (const key of keys) delete areas[area][key];
      },
    }),
    (error) => {
      if (!(error instanceof BackupWriteError)) return false;
      recover = error.retryRestore;
      return Boolean(recover);
    },
  );
  assert.ok(recover);
  blocked = false;
  areas.local.profileId = 'chosen in another tab';
  areas.local.history = {Sintel: {count: 1, query: 'Sintel'}};
  areas.sync.options = {contextMenu: true, hidePeerRow: true};
  await recover();
  assert.deepEqual(areas, {
    local: {profileId: 'chosen in another tab'},
    sync: {options: {contextMenu: true, hidePeerRow: true}},
  });
});
