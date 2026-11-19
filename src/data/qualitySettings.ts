import {queryOptions} from '@tanstack/react-query';

import {
  defaults,
  upgradeBundledQuality,
  validateQualityImport,
  type QualityConfig,
} from '../tools/qualityConfig';
import storageGet from '../tools/storageGet';
import storageSet from '../tools/storageSet';
import {readOptions, type ExtensionOptions} from './options';

export interface QualityRecord {
  revision: string;
  config: QualityConfig;
}

const key = 'qualitySettings';

async function readQualitySettings(): Promise<QualityRecord | null> {
  const raw = (await storageGet({[key]: null as unknown}))[key];
  if (
    !raw ||
    typeof raw !== 'object' ||
    !('revision' in raw) ||
    typeof raw.revision !== 'string' ||
    !('config' in raw)
  )
    return null;
  try {
    const config = {...defaults, ...validateQualityImport(raw.config)};
    return {revision: raw.revision, config: await upgradeBundledQuality(config)};
  } catch {
    return null;
  }
}

export const qualitySettingsQuery = queryOptions({
  queryKey: ['storage', 'local', key],
  queryFn: readQualitySettings,
});

export function effectiveQuality(
  record: QualityRecord | null,
  options: ExtensionOptions,
): QualityConfig {
  return {
    ...(record?.config ?? defaults),
    includeDate: options.rankByReleaseDate,
    includeSeeds: options.rankBySeeds,
    includeLeeches: options.rankByLeeches,
  };
}

export function qualityRevision(record: QualityRecord | null, options: ExtensionOptions) {
  return JSON.stringify([
    record?.revision,
    options.rankByReleaseDate,
    options.rankBySeeds,
    options.rankByLeeches,
  ]);
}

export class QualityConflict extends Error {}

export function saveQualitySettings(config: QualityConfig, expected: string) {
  const clean = {...defaults, ...validateQualityImport(config)};
  return navigator.locks.request('tsearch:options', async () => {
    const [current, options] = await Promise.all([readQualitySettings(), readOptions()]);
    if (qualityRevision(current, options) !== expected) throw new QualityConflict();
    const next: QualityRecord = {revision: crypto.randomUUID(), config: clean};
    const flags = {
      rankByReleaseDate: clean.includeDate,
      rankBySeeds: clean.includeSeeds,
      rankByLeeches: clean.includeLeeches,
    };
    await storageSet({[key]: next});
    try {
      if (
        Object.entries(flags).some(([flag, value]) => options[flag as keyof typeof flags] !== value)
      ) {
        await storageSet({options: {...options, ...flags}}, 'sync');
      }
    } catch (error) {
      if (current) await storageSet({[key]: current});
      else await chrome.storage.local.remove(key);
      throw error;
    }
    return {record: next, options: {...options, ...flags}};
  });
}
