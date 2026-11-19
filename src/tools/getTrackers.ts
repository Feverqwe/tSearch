import {readTrackerRecords} from '../data/trackerRecords';

import getLogger from './getLogger';
import loadLocalTrackerModule from './loadLocalTrackerModule';
import {prepareTrackerDefinition} from './trackerDefinition';

import builtInTrackers from '../trackers.json';

const logger = getLogger('getTrackers');

export default async function getTrackers() {
  const records = await readTrackerRecords();
  const packaged = await Promise.all(
    Object.keys(builtInTrackers).map(async (id) => {
      try {
        const saved = records[id];
        if (saved?.options?.localOverride === true) return [id, saved] as const;
        // Older releases cached bundled scripts too. A pinned JSON definition is portable.
        if (saved?.options?.autoUpdate === false) {
          try {
            const definition = prepareTrackerDefinition(saved.code);
            return [
              id,
              {...saved, ...definition, options: {...saved.options, localOverride: true}},
            ] as const;
          } catch {
            // The editor still exposes the saved code for review and approval.
          }
        }
        const tracker = await loadLocalTrackerModule(id);
        return [id, {...tracker, options: saved?.options}] as const;
      } catch (error) {
        logger.error('Could not load packaged tracker', id, error);
        return undefined;
      }
    }),
  );
  return {
    ...records,
    ...Object.fromEntries(packaged.filter((record) => record !== undefined)),
  };
}
