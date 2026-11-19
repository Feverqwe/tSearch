import type {ProfileRecord} from '../stores/ProfileStore.ts';

export class ProfileConflict extends Error {}

export function profileIdentity(profile: ProfileRecord | undefined) {
  return (
    profile &&
    JSON.stringify({
      name: profile.name,
      trackers: profile.trackers.map(({id, options}) => [id, options.enableProxy]),
    })
  );
}

export function mergeProfileDraft(
  current: readonly ProfileRecord[],
  baseline: ProfileRecord | undefined,
  draft: ProfileRecord,
) {
  const existing = current.find(({id}) => id === draft.id);
  if (profileIdentity(existing) !== profileIdentity(baseline)) throw new ProfileConflict();
  if (!existing) return [...current, draft];
  return current.map((profile) => (profile.id === draft.id ? draft : profile));
}

export function mergeProfileOrder(
  current: readonly ProfileRecord[],
  baseline: readonly ProfileRecord[],
  ids: readonly string[],
) {
  const originals = new Map(baseline.map((profile) => [profile.id, profile]));
  const records = new Map(current.map((profile) => [profile.id, profile]));
  const retained = new Set(ids);
  const latestOrder = current.filter(({id}) => originals.has(id)).map(({id}) => id);
  const baseOrder = baseline.filter(({id}) => records.has(id)).map(({id}) => id);
  if (latestOrder.some((id, index) => id !== baseOrder[index])) throw new ProfileConflict();
  for (const original of baseline) {
    const existing = records.get(original.id);
    if (
      existing &&
      !retained.has(original.id) &&
      profileIdentity(existing) !== profileIdentity(original)
    ) {
      throw new ProfileConflict();
    }
  }
  const ordered = ids.flatMap((id) => {
    const item = records.get(id);
    return item ? [item] : [];
  });
  return [...ordered, ...current.filter(({id}) => !originals.has(id) && !retained.has(id))];
}
