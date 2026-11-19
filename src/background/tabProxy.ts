import {serializeError} from 'serialize-error';

import {
  type TabProxyReply,
  type TabProxyRequest,
  readTabProxyMode,
  tabProxyPort,
} from '../tools/tabProxy';

const extensionUrl = chrome.runtime.getURL('');
const popupWidth = 240;
const popupHeight = 160;
const popupMargin = 12;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== tabProxyPort || !port.sender?.url?.startsWith(extensionUrl)) return;

  const disconnected = new AbortController();
  port.onDisconnect.addListener(() => disconnected.abort());

  let started = false;
  port.onMessage.addListener((request: TabProxyRequest) => {
    if (started) return;
    started = true;
    void fetchThroughTab(request, disconnected.signal).then(
      (result) => {
        if (!disconnected.signal.aborted) port.postMessage(result);
      },
      (error: unknown) => {
        if (!disconnected.signal.aborted) port.postMessage({error: serializeError(error)});
      },
    );
  });
});

async function fetchThroughTab(request: TabProxyRequest, disconnected: AbortSignal) {
  const origin = httpUrl(request.origin);
  const target = httpUrl(request.url);
  if (
    request.approvedOrigin !== undefined &&
    (origin.origin !== request.approvedOrigin || target.origin !== request.approvedOrigin)
  ) {
    throw new Error('Tab request is outside the approved tracker origin');
  }
  const signal = AbortSignal.any([disconnected, AbortSignal.timeout(60_000)]);
  const {options} = await chrome.storage.sync.get<{options?: {tabProxyMode?: unknown}}>('options');
  const mode = readTabProxyMode(options?.tabProxyMode);
  let windowId: number | undefined;
  let tabId: number | undefined;

  try {
    signal.throwIfAborted();
    if (mode === 'window') {
      const window = await createTrackerWindow(origin.href, request.screenCorner, signal);
      windowId = window?.id;
      tabId = window?.tabs?.[0]?.id;
    } else {
      // Mute the tab before loading the site.
      const tab = await chrome.tabs.create({url: 'about:blank', active: false});
      tabId = tab.id;
    }
    if (tabId === undefined) throw new Error('Could not create a tab for the tracker request');
    signal.throwIfAborted();
    await chrome.tabs.update(
      tabId,
      mode === 'tab' ? {url: origin.href, muted: true} : {muted: true},
    );
    await waitForDocument(tabId, signal);
    await chrome.scripting.executeScript({target: {tabId}, files: ['js/tab-fetch.js']});
    signal.throwIfAborted();
    return await waitForResult(tabId, request, signal);
  } finally {
    if (windowId !== undefined) await chrome.windows.remove(windowId).catch(() => {});
    else if (tabId !== undefined) await chrome.tabs.remove(tabId).catch(() => {});
  }
}

async function createTrackerWindow(
  url: string,
  corner: TabProxyRequest['screenCorner'],
  signal: AbortSignal,
) {
  const options = {
    url,
    type: 'popup' as const,
    focused: false,
    width: popupWidth,
    height: popupHeight,
  };
  if (corner) {
    try {
      return await chrome.windows.create({
        ...options,
        left: corner.right - popupWidth - popupMargin,
        top: corner.bottom - popupHeight - popupMargin,
      });
    } catch {
      // Chrome can reject stale display coordinates after a change in the screen layout.
      signal.throwIfAborted();
    }
  }
  return chrome.windows.create(options);
}

function httpUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError('Tracker requests require HTTP or HTTPS');
  }
  return url;
}

function waitForDocument(tabId: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    function finish(error?: unknown) {
      signal.removeEventListener('abort', onAbort);
      chrome.tabs.onUpdated.removeListener(onUpdate);
      chrome.tabs.onRemoved.removeListener(onRemove);
      if (error) reject(error);
      else resolve();
    }

    function onAbort() {
      finish(signal.reason);
    }

    function onUpdate(id: number, change: chrome.tabs.OnUpdatedInfo) {
      if (id === tabId && change.status === 'complete') finish();
    }

    function onRemove(id: number) {
      if (id === tabId) finish(new Error('Tracker tab was closed'));
    }

    signal.throwIfAborted();
    signal.addEventListener('abort', onAbort, {once: true});
    chrome.tabs.onUpdated.addListener(onUpdate);
    chrome.tabs.onRemoved.addListener(onRemove);
    void chrome.tabs.get(tabId).then((tab) => {
      if (tab.status === 'complete') finish();
    }, finish);
  });
}

function waitForResult(tabId: number, request: TabProxyRequest, signal: AbortSignal) {
  return new Promise<TabProxyReply>((resolve, reject) => {
    function onAbort() {
      reject(signal.reason);
    }
    signal.throwIfAborted();
    signal.addEventListener('abort', onAbort, {once: true});
    void chrome.tabs
      .sendMessage(tabId, {action: tabProxyPort, request})
      .then(resolve, reject)
      .finally(() => signal.removeEventListener('abort', onAbort));
  });
}
