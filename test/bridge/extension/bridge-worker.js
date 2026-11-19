async function fetchForTest({url, init, body, timeout}, inTab = false) {
  try {
    const target = new URL(url);
    if (!['http:', 'https:'].includes(target.protocol)) {
      throw new TypeError('The browser bridge requires HTTP or HTTPS');
    }
    if (inTab && location.origin !== target.origin) {
      throw new Error('The site tab changed origin before the Bridge request');
    }
    const response = await fetch(target.href, {
      ...init,
      body: typeof body === 'string' ? Uint8Array.fromBase64(body) : undefined,
      signal: AbortSignal.timeout(timeout),
    });
    return {
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers],
      url: response.url,
      redirected: response.redirected,
      type: response.type,
      body: response.body === null ? null : new Uint8Array(await response.arrayBuffer()).toBase64(),
    };
  } catch (error) {
    if (inTab) return {error: error.message};
    throw error;
  }
}

async function dispatchRequest(options, defaultContext = 'extension') {
  const {requestContext = defaultContext} = options;
  if (requestContext === 'extension') return fetchForTest(options);
  if (requestContext !== 'tab') {
    throw new TypeError('Bridge requestContext must be "extension" or "tab"');
  }

  const url = new URL(options.url);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new TypeError('The browser bridge requires HTTP or HTTPS');
  }
  const pattern = `${url.protocol}//${url.hostname}/*`;
  const tabs = await chrome.tabs.query({url: pattern, status: 'complete', discarded: false});
  const candidates = tabs.filter((tab) => tab.url && new URL(tab.url).origin === url.origin);
  const tab = candidates.find((entry) => entry.active) ?? candidates[0];
  if (tab?.id === undefined) throw new Error(`Open ${url.origin} in the test Chrome profile`);
  const [{result}] = await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: fetchForTest,
    args: [
      {
        ...options,
        init: {
          ...options.init,
          credentials: options.init.credentials === 'omit' ? 'omit' : 'same-origin',
        },
      },
      true,
    ],
  });
  if (!result || result.error) throw new Error(result?.error ?? 'No response from the site tab');
  return result;
}

globalThis.dispatchRequest = dispatchRequest;

const manifest = chrome.runtime.getManifest();
if (manifest.permissions?.includes('nativeMessaging')) {
  let port;
  const connect = () => {
    if (port) return;
    const connection = chrome.runtime.connectNative('org.tsearch.bridge');
    port = connection;
    connection.onDisconnect.addListener(() => {
      port = undefined;
      chrome.action.setBadgeText({text: 'OFF'});
      if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message);
    });
    connection.onMessage.addListener(async ({ready, restart, id, options}) => {
      if (restart) {
        chrome.runtime.reload();
        return;
      }
      if (ready) {
        chrome.action.setBadgeText({text: 'ON'});
        return;
      }
      try {
        const url = new URL(options.url);
        const pattern = `${url.protocol}//${url.hostname}/*`;
        if (!manifest.host_permissions.includes(pattern)) {
          throw new Error('Site is outside the Bridge configuration');
        }
        const result = await dispatchRequest(options, 'tab');
        connection.postMessage({id, result});
      } catch (error) {
        if (port === connection) connection.postMessage({id, error: error.message});
      }
    });
  };
  chrome.runtime.onInstalled.addListener(connect);
  chrome.runtime.onStartup.addListener(connect);
  chrome.action.onClicked.addListener(connect);
  connect();
}
