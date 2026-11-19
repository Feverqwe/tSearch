import {readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

import getExploreModuleCodeMeta from '../src/tools/getExploreModuleCodeMeta.ts';
import getTrackerCodeMeta from '../src/tools/getTrackerCodeMeta.ts';
import {sourceDir} from './paths.ts';

const catalogs = {
  explorers: {directory: 'explorerModules', readMetadata: getExploreModuleCodeMeta},
  trackers: {directory: 'trackers', readMetadata: getTrackerCodeMeta},
};
const catalog = process.argv[2];
if (!Object.hasOwn(catalogs, catalog)) {
  throw new Error(`Unknown catalog: ${catalog}`);
}

const {directory, readMetadata} = catalogs[catalog as keyof typeof catalogs];
const place = path.join(sourceDir, directory);
const files = (await readdir(place, {withFileTypes: true}))
  .filter((file) => file.isFile() && path.extname(file.name) === '.ts')
  .map((file) => file.name)
  .sort();
const entries = await Promise.all(
  files.map(async (filename) => {
    try {
      const code = await readFile(path.join(place, filename), 'utf8');
      return [path.basename(filename, '.ts'), readMetadata(code).version];
    } catch (cause) {
      throw new Error(`Could not index ${directory}/${filename}`, {cause});
    }
  }),
);
await writeFile(
  path.join(sourceDir, `${catalog}.json`),
  JSON.stringify(Object.fromEntries(entries), null, 2) + '\n',
);
