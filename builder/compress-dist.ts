import {randomUUID} from 'node:crypto';
import {createWriteStream} from 'node:fs';
import {access, readFile, readdir, rename, rm} from 'node:fs/promises';
import path from 'node:path';
import {pipeline} from 'node:stream/promises';

import JSZip from 'jszip';

import manifest from '../src/manifest.json' with {type: 'json'};
import {extensionDir, outputDir} from './paths.ts';

await access(path.join(extensionDir, 'manifest.json'));
const files = (await readdir(extensionDir, {recursive: true, withFileTypes: true}))
  .filter((entry) => entry.isFile())
  .map((entry) => path.relative(extensionDir, path.join(entry.parentPath, entry.name)))
  .sort();
const zip = new JSZip();
for (const filename of files) {
  zip.file(filename.split(path.sep).join('/'), await readFile(path.join(extensionDir, filename)));
}

const destination = path.join(outputDir, `tms-${manifest.version}.zip`);
const temporaryZip = `${destination}.${randomUUID()}.tmp`;
try {
  await pipeline(
    zip.generateNodeStream({compression: 'DEFLATE', streamFiles: true}),
    createWriteStream(temporaryZip),
  );
  await rename(temporaryZip, destination);
} finally {
  await rm(temporaryZip, {force: true});
}
