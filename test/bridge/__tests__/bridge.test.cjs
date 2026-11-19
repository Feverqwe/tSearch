const {createServer} = require('node:http');
const {once} = require('node:events');
const {mkdtemp, rm} = require('node:fs/promises');
const {tmpdir} = require('node:os');
const path = require('node:path');
const {launchBridge} = require('../browser.cjs');
const {connectLiveBridge, startLiveBridge} = require('../live.cjs');
const {browserTransport} = require('../prepare-extension.cjs');

test('restart waits for a replacement Bridge that can serve requests', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tsearch-bridge-restart-'));
  const file = path.join(root, 'connection.json');
  let stopOld;
  let stopNew;

  try {
    const oldDir = await mkdtemp(path.join(root, 'old-'));
    const newDir = await mkdtemp(path.join(root, 'new-'));
    const transport = (body) => ({status: 200, headers: [['x-bridge', body]]});
    stopOld = await startLiveBridge(oldDir, async () => transport('old'), file, {
      async restart() {
        await stopOld();
        stopNew = await startLiveBridge(newDir, async () => transport('new'), file);
      },
    });

    const bridge = connectLiveBridge(file);
    const url = 'https://example.com/';
    expect((await bridge.fetch(url)).headers.get('x-bridge')).toBe('old');
    await bridge.restart();
    expect((await bridge.fetch(url)).headers.get('x-bridge')).toBe('new');
  } finally {
    await stopOld?.();
    await stopNew?.();
    await rm(root, {recursive: true, force: true});
  }
});

test('fetch selects the browser context and can use a saved session', async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/login') {
      response.setHeader(
        'Set-Cookie',
        'session=fixture; Path=/; Max-Age=3600; HttpOnly; SameSite=Strict',
      );
      response.end('Signed in');
      return;
    }
    if (!request.headers.cookie?.split('; ').includes('session=fixture')) {
      response.writeHead(401).end('Login required');
      return;
    }
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    response.setHeader('Content-Type', 'application/json');
    response.end(
      JSON.stringify({
        method: request.method,
        query: new URLSearchParams(Buffer.concat(chunks).toString()).get('q'),
      }),
    );
  });
  const profileDir = await mkdtemp(path.join(tmpdir(), 'tsearch-bridge-test-profile-'));
  let bridge;
  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const origin = `http://127.0.0.1:${server.address().port}`;
    const options = {profileDir, origins: [origin]};
    bridge = await launchBridge(options);
    const before = await bridge.fetch(`${origin}/search`);
    expect(before.status).toBe(401);
    expect(await before.text()).toBe('Login required');

    const connection = path.join(profileDir, 'bridge-connection.json');
    const stopBridge = await startLiveBridge(
      profileDir,
      await browserTransport(bridge.context),
      connection,
    );
    try {
      const {fetch} = connectLiveBridge(connection);
      const direct = await fetch(`${origin}/search`, {requestContext: 'extension'});
      expect(direct.status).toBe(401);
      await expect(fetch(`${origin}/search`)).rejects.toThrow(`Open ${origin}`);

      const page = await bridge.context.newPage();
      await page.goto(`${origin}/login`, {waitUntil: 'networkidle'});
      const signedIn = await fetch(`${origin}/search`);
      expect(signedIn.ok).toBe(true);
      const anonymous = await fetch(`${origin}/search`, {credentials: 'omit'});
      expect(anonymous.status).toBe(401);
    } finally {
      await stopBridge();
    }

    await bridge.close();
    bridge = await launchBridge(options);

    const {fetch} = bridge;
    const response = await fetch(`${origin}/search`, {
      method: 'POST',
      body: new URLSearchParams({q: 'Лёд & jazz'}),
    });
    expect(response.ok).toBe(true);
    expect(response.url).toBe(`${origin}/search`);
    expect(await response.json()).toEqual({method: 'POST', query: 'Лёд & jazz'});
  } finally {
    await bridge?.close();
    await new Promise((resolve) => server.close(resolve));
    await rm(profileDir, {recursive: true, force: true});
  }
}, 30_000);
