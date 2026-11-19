type StorageArea = 'local' | 'sync';

export default function storageGet<T extends Record<string, unknown>>(
  defaults: T,
  area?: StorageArea,
): Promise<T>;
export default function storageGet(
  keys: string | string[] | null,
  area?: StorageArea,
): Promise<Record<string, unknown>>;
export default async function storageGet(
  keys: Record<string, unknown> | string | string[] | null,
  area: StorageArea = 'local',
): Promise<Record<string, unknown>> {
  return chrome.storage[area].get(keys);
}
