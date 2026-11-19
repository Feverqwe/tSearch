const {mkdtemp, rm} = require('node:fs/promises');
const {tmpdir} = require('node:os');
const path = require('node:path');
const {chromium} = require('playwright');
const {prepareBridgeExtension, browserTransport} = require('./prepare-extension.cjs');
const {createFetch} = require('./fetch.cjs');

async function launchBridge({origins, profileDir, headless = true}) {
  const temporaryDir = await mkdtemp(path.join(tmpdir(), 'tsearch-bridge-'));
  let context;
  async function close() {
    try {
      await context?.close();
    } finally {
      await rm(temporaryDir, {recursive: true, force: true});
    }
  }

  try {
    const {extensionDir, allowedOrigins} = await prepareBridgeExtension(temporaryDir, origins);
    context = await chromium.launchPersistentContext(
      profileDir ?? path.join(temporaryDir, 'profile'),
      {
        channel: 'chromium',
        headless,
        ignoreDefaultArgs: ['--disable-extensions'],
        args: [`--load-extension=${extensionDir}`],
      },
    );
    const transport = await browserTransport(context);
    return {
      context,
      close,
      fetch: createFetch(transport, {allowedOrigins}),
    };
  } catch (error) {
    await close();
    throw error;
  }
}

module.exports = {launchBridge};
