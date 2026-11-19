const {randomUUID} = require('node:crypto');
const {once} = require('node:events');
const {readFile, rename, rm, writeFile} = require('node:fs/promises');
const {createServer, request} = require('node:http');
const path = require('node:path');
const {setTimeout: delay} = require('node:timers/promises');
const {createFetch} = require('./fetch.cjs');

const connectionFile = path.resolve(__dirname, '../../dist/bridge-connection.json');
const notRunning = 'Open the test Chrome profile and connect tSearch Test Bridge';

async function startLiveBridge(temporaryDir, transport, file = connectionFile, {restart} = {}) {
  const socketPath =
    process.platform === 'win32'
      ? `\\\\.\\pipe\\tsearch-bridge-${randomUUID()}`
      : path.join(temporaryDir, 'fetch.sock');
  const token = randomUUID();
  const pendingFile = `${file}.${process.pid}`;
  let restarting = false;
  const server = createServer(async (incoming, outgoing) => {
    if (incoming.method !== 'POST' || incoming.headers.authorization !== `Bearer ${token}`) {
      outgoing.writeHead(404).end();
      return;
    }
    if (incoming.url === '/restart' && restart) {
      if (restarting) {
        outgoing
          .writeHead(503)
          .end(JSON.stringify({error: 'Bridge restart is already in progress'}));
        return;
      }
      restarting = true;
      // Finish the HTTP reply before shutting down the old Native Messaging host.
      outgoing.end(JSON.stringify({result: null}), () => {
        void restart().catch((error) => console.error(error.message));
      });
      return;
    }
    if (incoming.url !== '/fetch') {
      outgoing.writeHead(404).end();
      return;
    }
    try {
      const options = await readJson(incoming);
      const result = await transport(options);
      outgoing.end(JSON.stringify({result}));
    } catch (error) {
      outgoing.writeHead(502).end(JSON.stringify({error: error.message}));
    }
  });

  async function close() {
    if (server.listening) {
      const closed = new Promise((resolve) => server.close(resolve));
      server.closeAllConnections();
      await closed;
    }
  }

  try {
    server.listen(socketPath);
    await once(server, 'listening');
    await writeFile(pendingFile, JSON.stringify({socketPath, token}), {mode: 0o600, flag: 'wx'});
    await rename(pendingFile, file);
  } catch (error) {
    await close();
    await rm(pendingFile, {force: true});
    throw error;
  }
  let stopping;
  return () => (stopping ??= unpublish());

  async function unpublish() {
    await close();
    // A newer browser may already have announced its own endpoint.
    const published = await readFile(file, 'utf8').catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
    if (published && JSON.parse(published).token === token) await rm(file, {force: true});
  }
}

function connectLiveBridge(file = connectionFile) {
  return {
    fetch: createFetch(send, {defaultContext: 'tab', defaultCredentials: 'same-origin'}),
    restart,
  };

  async function send(options) {
    return post('/fetch', await getConnection(), options);
  }

  async function restart() {
    const connection = await getConnection();
    await post('/restart', connection);

    const deadline = performance.now() + 10_000;
    while (performance.now() < deadline) {
      const current = await getConnection().catch((error) => {
        if (error.cause?.code !== 'ENOENT') throw error;
      });
      if (current && current.token !== connection.token) return;
      await delay(100);
    }
    throw new Error('Bridge did not reconnect after restart');
  }

  async function getConnection() {
    try {
      return JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') throw new Error(notRunning, {cause: error});
      throw error;
    }
  }

  async function post(route, {socketPath, token}, options) {
    try {
      const body = options === undefined ? '' : JSON.stringify(options);
      const reply = await new Promise((resolve, reject) => {
        const call = request(
          {
            socketPath,
            path: route,
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Length': Buffer.byteLength(body),
            },
            signal: AbortSignal.timeout(20_000),
          },
          (response) => {
            if (route === '/restart' && response.statusCode === 404) {
              response.resume();
              reject(
                new Error(
                  'Reload tSearch Test Bridge once in chrome://extensions to enable restart',
                ),
              );
            } else {
              readJson(response).then(resolve, reject);
            }
          },
        );
        call.on('error', reject);
        call.end(body);
      });
      if ('error' in reply) throw new Error(reply.error);
      return reply.result;
    } catch (error) {
      if (['ENOENT', 'ECONNREFUSED'].includes(error.code)) {
        throw new Error(notRunning, {cause: error});
      }
      throw error;
    }
  }
}

async function readJson(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}

module.exports = {connectLiveBridge, startLiveBridge};
