import {serializeError} from 'serialize-error';

import arrayBufferToBase64 from './tools/arrayBufferToBase64';
import {tabProxyPort, type TabProxyRequest, type TabProxyResult} from './tools/tabProxy';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.action !== tabProxyPort) return;
  void fetchInTab(message.request).then(
    (result) => sendResponse({result}),
    (error: unknown) => sendResponse({error: serializeError(error)}),
  );
  return true;
});

async function fetchInTab({
  origin,
  approvedOrigin,
  url,
  options,
}: TabProxyRequest): Promise<TabProxyResult> {
  const target = new URL(url);
  const site = new URL(origin);

  if (approvedOrigin !== undefined) {
    if (
      site.origin !== approvedOrigin ||
      target.origin !== approvedOrigin ||
      location.origin !== approvedOrigin
    ) {
      throw new Error('Tracker tab is outside the approved origin');
    }
  } else {
    // Packaged and JSON trackers can use a site that upgrades its landing page to HTTPS.
    if (location.hostname !== site.hostname) throw new Error('Tracker tab changed host');
    if (target.origin === site.origin && location.origin !== site.origin) {
      target.protocol = location.protocol;
      target.port = location.port;
    }
  }

  const response = await fetch(
    target,
    approvedOrigin === undefined ? options : {...options, mode: 'same-origin'},
  );
  if (!response.ok) {
    throw Object.assign(new Error(`HTTP ${response.status}`), {
      statusCode: response.status,
      response: {url: response.url, status: response.status, statusText: response.statusText},
    });
  }

  return {
    response: {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      headers: Array.from(response.headers.entries()),
    },
    base64: arrayBufferToBase64(await response.arrayBuffer()),
  };
}
