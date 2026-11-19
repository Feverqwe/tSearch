const {mkdtemp, rm} = require('node:fs/promises');
const {endianness, tmpdir} = require('node:os');
const path = require('node:path');
const {startLiveBridge} = require('./live.cjs');

const byteOrder = endianness();
const maxMessageToChrome = 1024 * 1024;
const maxMessageFromChrome = 64 * 1024 * 1024;

async function run() {
  const [allowedOrigin, caller] = process.argv.slice(2);
  if (!allowedOrigin || allowedOrigin !== caller) throw new Error('Unexpected Bridge extension');

  const temporaryDir = await mkdtemp(path.join(tmpdir(), 'tsearch-native-'));
  const pending = new Map();
  let id = 0;
  let stopBridge;
  process.once('SIGTERM', () => process.stdin.destroy());
  try {
    stopBridge = await startLiveBridge(temporaryDir, fetchInChrome, undefined, {restart});
    send({ready: true});
    for await (const message of readMessages(process.stdin)) {
      const reply = pending.get(message.id);
      if (!reply) continue;
      pending.delete(message.id);
      clearTimeout(reply.timer);
      if ('error' in message) reply.reject(new Error(message.error));
      else reply.resolve(message.result);
    }
  } finally {
    for (const {reject, timer} of pending.values()) {
      clearTimeout(timer);
      reject(new Error('Chrome closed the Bridge connection'));
    }
    try {
      await stopBridge?.();
    } finally {
      await rm(temporaryDir, {recursive: true, force: true});
    }
  }

  function fetchInChrome(options) {
    const requestId = ++id;
    send({id: requestId, options});
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error('Chrome did not answer the Bridge request'));
      }, 17_000);
      pending.set(requestId, {resolve, reject, timer});
    });
  }

  async function restart() {
    await stopBridge();
    send({restart: true});
  }
}

function send(message) {
  const body = Buffer.from(JSON.stringify(message));
  if (body.length > maxMessageToChrome)
    throw new Error('Request exceeds the Native Messaging size limit');
  const frame = Buffer.allocUnsafe(4 + body.length);
  frame[`writeUInt32${byteOrder}`](body.length, 0);
  body.copy(frame, 4);
  process.stdout.write(frame);
}

async function* readMessages(stream) {
  let buffered = Buffer.alloc(0);
  for await (const chunk of stream) {
    buffered = Buffer.concat([buffered, chunk]);
    while (buffered.length >= 4) {
      const length = buffered[`readUInt32${byteOrder}`](0);
      if (length > maxMessageFromChrome)
        throw new Error('Response exceeds the Native Messaging size limit');
      if (buffered.length < length + 4) break;
      yield JSON.parse(buffered.subarray(4, length + 4).toString());
      buffered = buffered.subarray(length + 4);
    }
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
