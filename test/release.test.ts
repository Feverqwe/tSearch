import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {before, test} from 'node:test';

import JSZip from 'jszip';
import {parse, type DefaultTreeAdapterTypes} from 'parse5';
import sourceManifest from '../src/manifest.json' with {type: 'json'};

import {extensionDir, outputDir} from '../builder/paths.ts';

let zip: JSZip;
let manifest: typeof sourceManifest;

async function read(filename: string): Promise<string>;
async function read(filename: string, type: 'nodebuffer'): Promise<Buffer>;
async function read(filename: string, type: 'string' | 'nodebuffer' = 'string') {
  const file = zip.file(filename);
  assert.ok(file, `Missing from extension ZIP: ${filename}`);
  return file.async(type);
}

before(async () => {
  const filename = path.join(outputDir, `tms-${sourceManifest.version}.zip`);
  zip = await JSZip.loadAsync(await readFile(filename), {checkCRC32: true});
  manifest = JSON.parse(await read('manifest.json'));
});

test('release ZIP contains the unpacked extension at the archive root', async () => {
  const files = await readdir(extensionDir, {recursive: true, withFileTypes: true});
  const expected = files
    .filter((file) => file.isFile())
    .map((file) =>
      path.relative(extensionDir, path.join(file.parentPath, file.name)).split(path.sep).join('/'),
    )
    .sort();
  const archived = Object.values(zip.files)
    .filter((file) => !file.dir)
    .map((file) => file.name)
    .sort();
  assert.deepEqual(archived, expected);
  await Promise.all(
    expected.map(async (name) =>
      assert.deepEqual(
        await read(name, 'nodebuffer'),
        await readFile(path.join(extensionDir, name)),
        name,
      ),
    ),
  );
});

function* elements(node: DefaultTreeAdapterTypes.Node): Generator<DefaultTreeAdapterTypes.Element> {
  if ('tagName' in node) yield node;
  if ('childNodes' in node) {
    for (const child of node.childNodes) yield* elements(child);
  }
}

test('manifest and extension pages can resolve their scripts and styles', async () => {
  const root = 'https://extension.invalid/';
  const pages = [manifest.action.default_popup, manifest.options_page, ...manifest.sandbox.pages];
  for (const file of [
    manifest.background.service_worker,
    ...Object.values(manifest.icons),
    `_locales/${manifest.default_locale}/messages.json`,
  ]) {
    assert.ok((await read(file)).length, file);
  }

  for (const page of pages) {
    const url = new URL(page, root);
    const nodes = [...elements(parse(await read(url.pathname.slice(1))))];
    const scripts = nodes.filter((node) => node.tagName === 'script');
    assert.ok(scripts.length > 0, `${page} has no scripts`);
    if (!manifest.sandbox.pages.includes(page)) {
      assert.ok(
        nodes.some(
          (node) =>
            node.tagName === 'link' &&
            node.attrs.some(({name, value}) => name === 'rel' && value === 'stylesheet'),
        ),
        `${page} has no stylesheet`,
      );
    }

    for (const node of [...scripts, ...nodes.filter((node) => node.tagName === 'link')]) {
      const reference = node.attrs.find(({name}) => name === 'src' || name === 'href');
      assert.ok(reference?.value, `${page} has an inline script or a link without a target`);
      const asset = new URL(reference.value, url);
      assert.equal(asset.origin, url.origin, `${page} loads an external asset`);
      assert.ok((await read(asset.pathname.slice(1))).length, reference.value);
    }
  }
});
