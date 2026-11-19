export default function storageSet(
  data: Record<string, unknown>,
  area: 'local' | 'sync' = 'local',
): Promise<void> {
  return chrome.storage[area].set(data);
}
