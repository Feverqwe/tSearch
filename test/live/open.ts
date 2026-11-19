import {execFile, spawn} from 'node:child_process';
import {once} from 'node:events';
import {access, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {promisify} from 'node:util';
import {profileDir} from './profile.ts';

const destination = process.argv[2] ? new URL(process.argv[2]) : undefined;
if (destination && !['http:', 'https:'].includes(destination.protocol)) {
  throw new Error('Use an HTTP or HTTPS site URL.');
}

await mkdir(profileDir, {recursive: true, mode: 0o700});
const flags = [
  `--user-data-dir=${profileDir}`,
  // Preserve the keychain mode used by the existing Playwright profile on macOS.
  ...(process.platform === 'darwin' ? ['--password-store=basic', '--use-mock-keychain'] : []),
  destination?.href ?? 'chrome://extensions/',
];
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const hasMacChrome =
  process.platform === 'darwin' &&
  (await access(macChrome).then(
    () => true,
    () => false,
  ));
const chromePath = process.env.TSEARCH_CHROME_PATH ?? (hasMacChrome ? macChrome : undefined);

if (process.platform === 'darwin' && !chromePath) {
  await promisify(execFile)('open', ['-na', 'Google Chrome', '--args', ...flags]);
} else {
  const executable =
    chromePath ??
    (process.platform === 'win32'
      ? path.join(
          process.env.ProgramFiles ?? 'C:\\Program Files',
          'Google/Chrome/Application/chrome.exe',
        )
      : 'google-chrome');
  const chrome = spawn(executable, flags, {detached: true, stdio: 'ignore'});
  await once(chrome, 'spawn');
  chrome.unref();
}
