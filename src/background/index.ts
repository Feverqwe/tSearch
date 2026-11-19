import {compareVersions} from 'compare-versions';
import {serializeError} from 'serialize-error';

import './tabProxy';
import builtInTrackers from '../trackers.json';
import {prepareTrackerDefinition} from '../tools/trackerDefinition';
import {ErrorWithCode} from '../tools/errors';

interface TrackerMeta {
  version: string;
  updateURL?: string;
  downloadURL?: string;
}

interface SavedTracker {
  id: string;
  meta: TrackerMeta;
  code: string;
  options?: {autoUpdate?: boolean; lastUpdate?: number};
}

type TrackerMessage =
  | {action: 'update'}
  | {action: 'updateTracker'; id: string}
  | {action: 'downloadTracker'; id: string; updateURL?: string; downloadURL?: string};

const extensionUrl = chrome.runtime.getURL('');
const menuId = 'tms';
let actionUpdate = Promise.resolve();

chrome.omnibox.onInputEntered.addListener(openSearchPage);
chrome.action.onClicked.addListener(() => openSearchPage(''));
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === menuId) openSearchPage(info.selectionText ?? '');
});
chrome.runtime.onInstalled.addListener(queueActionUpdate);
chrome.runtime.onStartup.addListener(queueActionUpdate);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.options) queueActionUpdate();
});

chrome.runtime.onMessage.addListener((message: TrackerMessage, sender, respond) => {
  if (!message || !sender.url?.startsWith(extensionUrl)) return;
  let operation: Promise<unknown>;
  switch (message.action) {
    case 'downloadTracker':
      operation = downloadTracker(message);
      break;
    case 'updateTracker':
      operation = updateTracker(message.id);
      break;
    case 'update':
      operation = updateExternalTrackers();
      break;
    default:
      return;
  }
  void operation.then(
    (result) => respond({result}),
    (error: unknown) => respond({error: serializeError(error)}),
  );
  return true;
});

function openSearchPage(query: string) {
  const hash = query ? `#/search?${new URLSearchParams({query})}` : '';
  void chrome.tabs.create({url: `index.html${hash}`});
}

function queueActionUpdate() {
  actionUpdate = actionUpdate.then(applyActionOptions).catch(console.error);
}

async function applyActionOptions() {
  const {options} = (await chrome.storage.sync.get({options: {}})) as {
    options: {
      invertIcon?: boolean;
      disablePopup?: boolean;
      contextMenu?: boolean;
    };
  };
  const suffix = options.invertIcon ? '_i' : '';
  await Promise.all([
    chrome.action.setIcon({
      path: {
        19: `assets/icons/icon_19${suffix}.png`,
        38: `assets/icons/icon_38${suffix}.png`,
      },
    }),
    chrome.action.setPopup({popup: options.disablePopup ? '' : 'popup.html'}),
    chrome.contextMenus.removeAll(),
  ]);
  if (options.contextMenu !== false) {
    await new Promise<void>((resolve, reject) => {
      chrome.contextMenus.create(
        {
          id: menuId,
          title: chrome.i18n.getMessage('contextMenuTitle'),
          contexts: ['selection'],
        },
        () => {
          const error = chrome.runtime.lastError;
          if (error) reject(new Error(error.message));
          else resolve();
        },
      );
    });
  }
}

async function readTrackers(): Promise<Record<string, SavedTracker>> {
  const {trackers} = await chrome.storage.local.get({trackers: {}});
  return trackers as Record<string, SavedTracker>;
}

async function downloadTracker({
  id,
  updateURL,
  downloadURL,
}: Extract<TrackerMessage, {action: 'downloadTracker'}>) {
  assertExternalTracker(id);
  const tracker = await fetchTracker(updateURL, downloadURL);
  return saveTracker(id, tracker);
}

async function updateTracker(id: string, automatic = false) {
  assertExternalTracker(id);
  const trackers = await readTrackers();
  const saved = Object.hasOwn(trackers, id) ? trackers[id] : undefined;
  if (!saved) throw new Error('Tracker is missing');
  if (automatic && saved.options?.autoUpdate === false) return false;
  const {updateURL, downloadURL} = saved.meta;
  const tracker = await fetchTracker(updateURL, downloadURL);
  return saveTracker(id, tracker, {saved, automatic});
}

async function updateExternalTrackers() {
  const trackers = await readTrackers();
  return {
    trackers: await Promise.all(
      Object.keys(trackers)
        .filter(
          (id) =>
            !Object.hasOwn(builtInTrackers, id) &&
            trackers[id].options?.autoUpdate !== false &&
            (trackers[id].meta.downloadURL || trackers[id].meta.updateURL),
        )
        .map(async (id) => {
          try {
            return {id, result: await updateTracker(id, true)};
          } catch (error) {
            return {id, error: serializeError(error)};
          }
        }),
    ),
  };
}

function assertExternalTracker(id: string) {
  if (!id || id === '__proto__' || Object.hasOwn(builtInTrackers, id)) {
    throw new Error('Only external JSON trackers can be updated');
  }
}

function saveTracker(
  id: string,
  tracker: Omit<SavedTracker, 'id'>,
  expected?: {saved: SavedTracker; automatic: boolean},
) {
  return navigator.locks.request('tsearch:trackers', async () => {
    const trackers = await readTrackers();
    const saved = Object.hasOwn(trackers, id) ? trackers[id] : undefined;
    if (expected) {
      if (saved && compareVersions(tracker.meta.version, saved.meta.version) <= 0) {
        throw new ErrorWithCode('New version is not found', 'NEW_VERSION_IS_NOT_FOUND');
      }
      if (
        !saved ||
        saved.code !== expected.saved.code ||
        saved.meta.updateURL !== expected.saved.meta.updateURL ||
        saved.meta.downloadURL !== expected.saved.meta.downloadURL ||
        (expected.automatic && saved.options?.autoUpdate === false)
      ) {
        throw new ErrorWithCode('Tracker changed while updating', 'TRACKER_CHANGED');
      }
    }
    trackers[id] = {
      ...tracker,
      id,
      options: {...saved?.options, lastUpdate: Math.floor(Date.now() / 1000)},
    };
    await chrome.storage.local.set({trackers});
    return true;
  });
}

async function fetchTracker(updateURL?: string, downloadURL?: string) {
  if (updateURL) {
    try {
      const update = await fetchDefinition(updateURL, false);
      const source = update.meta.downloadURL || downloadURL;
      if (source && source !== updateURL) return await fetchDefinition(source);
      return {...update, meta: {...update.meta, downloadURL: source || updateURL}};
    } catch (error) {
      if (!downloadURL || downloadURL === updateURL) throw error;
    }
  }
  if (!downloadURL) throw new ErrorWithCode('Download URL is missing', 'DOWNLOAD_URL_IS_EMPTY');
  return fetchDefinition(downloadURL);
}

async function fetchDefinition(value: string, useSourceAsDownload = true) {
  const url = new URL(value);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError('Tracker definitions require HTTP or HTTPS');
  }

  const response = await fetch(url, {signal: AbortSignal.timeout(25_000)});
  if (!response.ok) throw new ErrorWithCode(`HTTP ${response.status}`, 'BAD_RESPONSE');
  return prepareTrackerDefinition(
    await response.text(),
    useSourceAsDownload ? url.href : undefined,
  );
}
