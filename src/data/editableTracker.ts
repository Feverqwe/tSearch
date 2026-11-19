import {queryOptions} from '@tanstack/react-query';
import builtInTrackers from '../trackers.json';
import {readTrackerRecords, updateTrackerRecords} from './trackerRecords';
import {parseTrackerDefinition, prepareTrackerDefinition} from '../tools/trackerDefinition';
import {prepareTrackerScript, trackerScriptDigest} from '../tools/trackerScript';
import ModuleWorker from '../tools/moduleWorker';
import loadLocalTrackerModule from '../tools/loadLocalTrackerModule';

export interface TrackerDraft {
  code: string;
  autoUpdate: boolean;
  lastUpdate: number;
}

function requireEditableTracker(type: string, id: string) {
  if (type !== 'tracker' || !id || id === '__proto__') {
    throw new Error('Invalid tracker editor route');
  }
}

export const editableTracker = (type: string, id: string) =>
  queryOptions({
    queryKey: ['storage', 'local', 'trackers', 'editor', type, id],
    async queryFn(): Promise<TrackerDraft> {
      requireEditableTracker(type, id);
      const trackers = await readTrackerRecords();
      const builtIn = Object.hasOwn(builtInTrackers, id);
      const tracker = Object.hasOwn(trackers, id)
        ? trackers[id]
        : builtIn
          ? await loadLocalTrackerModule(id)
          : undefined;
      let code = tracker?.code ?? '';
      if (code) {
        try {
          code = JSON.stringify(parseTrackerDefinition(code), null, 2);
        } catch {
          // Keep the original text available for migration.
        }
      }
      return {
        code,
        autoUpdate: !builtIn && (trackers[id]?.options?.autoUpdate ?? true),
        lastUpdate: trackers[id]?.options?.lastUpdate ?? 0,
      };
    },
  });

export async function saveEditableTracker(
  type: string,
  id: string,
  draft: TrackerDraft,
  savedCode: string,
  approvedScript = false,
) {
  requireEditableTracker(type, id);
  const builtIn = Object.hasOwn(builtInTrackers, id);
  const script = approvedScript ? prepareTrackerScript(draft.code) : undefined;
  if (script) await ModuleWorker.validateScript(id, script);
  const digest = script ? await trackerScriptDigest(script.code) : undefined;
  await updateTrackerRecords(
    (trackers) => {
      const previous = Object.hasOwn(trackers, id) ? trackers[id] : undefined;
      const definition =
        script ??
        (previous && draft.code === savedCode
          ? previous
          : prepareTrackerDefinition(draft.code, previous?.meta.downloadURL));
      trackers[id] = {
        ...definition,
        id,
        options: {
          autoUpdate: !builtIn && !script && draft.autoUpdate,
          lastUpdate: previous?.options?.lastUpdate ?? draft.lastUpdate,
          ...(builtIn && {localOverride: true}),
        },
      };
    },
    {id, digest},
  );
}
