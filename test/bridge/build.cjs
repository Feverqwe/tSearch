const {createHash} = require('node:crypto');
const {chmod, mkdir, realpath, writeFile} = require('node:fs/promises');
const path = require('node:path');
const {prepareBridgeExtension} = require('./prepare-extension.cjs');

const output = path.resolve(__dirname, '../../dist/bridge-chrome');
const profile = path.resolve(__dirname, '../../.tsearch-test-profile');
const hostName = 'org.tsearch.bridge';
const origins = process.argv.slice(2);

async function build() {
  const native = process.platform === 'darwin' || process.platform === 'linux';
  const {extensionDir} = await prepareBridgeExtension(
    output,
    origins.length ? origins : ['https://rutracker.org', 'https://pb.wtf'],
    native
      ? {
          permissions: ['nativeMessaging', 'scripting'],
          action: {default_title: 'Connect tSearch Bridge'},
        }
      : {},
  );
  if (native) {
    const source = await realpath(extensionDir);
    // Chrome derives an unpacked extension's ID from its normalized path.
    const id = createHash('sha256')
      .update(source)
      .digest('hex')
      .slice(0, 32)
      .replace(/[0-9a-f]/g, (digit) => String.fromCharCode(97 + parseInt(digit, 16)));
    const origin = `chrome-extension://${id}/`;
    const executable = path.join(output, 'native-host.sh');
    const hostScript = path.join(__dirname, 'native-host.cjs');
    const quote = (value) => "'" + value.replaceAll("'", "'\\''") + "'";
    await writeFile(
      executable,
      `#!/bin/sh\nexec ${quote(process.execPath)} ${quote(hostScript)} ${quote(origin)} "$@"\n`,
    );
    await chmod(executable, 0o700);

    const registration = path.join(profile, 'NativeMessagingHosts');
    await mkdir(registration, {recursive: true, mode: 0o700});
    await writeFile(
      path.join(registration, hostName + '.json'),
      JSON.stringify({
        name: hostName,
        description: 'tSearch test profile fetch bridge',
        path: executable,
        type: 'stdio',
        allowed_origins: [origin],
      }),
      {mode: 0o600},
    );
  }
  console.log(extensionDir);
}

build().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
