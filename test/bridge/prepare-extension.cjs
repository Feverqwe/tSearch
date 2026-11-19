const {copyFile, mkdir, writeFile} = require('node:fs/promises');
const path = require('node:path');
const manifest = require('./extension/manifest.json');

async function prepareBridgeExtension(parentDir, origins, extraManifest = {}) {
  const allowedOrigins =
    origins === null
      ? null
      : new Set(
          origins.map((value) => {
            const url = new URL(value);
            if (!['http:', 'https:'].includes(url.protocol)) {
              throw new TypeError('The browser bridge requires HTTP or HTTPS');
            }
            return url.origin;
          }),
        );
  const hostPermissions =
    allowedOrigins === null
      ? ['http://*/*', 'https://*/*']
      : new Set(
          [...allowedOrigins].map((origin) => {
            const {protocol, hostname} = new URL(origin);
            return `${protocol}//${hostname}/*`;
          }),
        );
  const extensionDir = path.join(parentDir, 'extension');
  await mkdir(extensionDir, {recursive: true});
  await writeFile(
    path.join(extensionDir, 'manifest.json'),
    JSON.stringify({...manifest, ...extraManifest, host_permissions: [...hostPermissions]}),
  );
  await copyFile(
    path.join(__dirname, 'extension/bridge-worker.js'),
    path.join(extensionDir, 'bridge-worker.js'),
  );
  return {extensionDir, allowedOrigins};
}

async function browserTransport(context) {
  const isBridge = (worker) => {
    const url = new URL(worker.url());
    return url.protocol === 'chrome-extension:' && url.pathname === '/bridge-worker.js';
  };
  const worker =
    context.serviceWorkers().find(isBridge) ??
    (await context.waitForEvent('serviceworker', {predicate: isBridge, timeout: 10_000}));
  return (options) => worker.evaluate((request) => globalThis.dispatchRequest(request), options);
}

module.exports = {prepareBridgeExtension, browserTransport};
