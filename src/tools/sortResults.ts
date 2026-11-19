export const typeSortMap: Record<string, {reverse: boolean}> = {title: {reverse: true}};

type Sort = {by: string; direction: number};

export default function sortResults<T extends object>(
  results: readonly T[],
  sorts: readonly Sort[],
): T[] {
  return results.toSorted((first, second) => {
    for (const {by, direction} of sorts) {
      const key = by as keyof T;
      const a = first[key];
      const b = second[key];
      const aMissing = missing(a, by);
      const bMissing = missing(b, by);
      if (aMissing !== bMissing) return aMissing ? 1 : -1;
      if (aMissing) continue;
      if (by === 'quality') {
        const firstTier = (first as {titleMatchTier?: number}).titleMatchTier ?? 3;
        const secondTier = (second as {titleMatchTier?: number}).titleMatchTier ?? 3;
        if (firstTier !== secondTier) {
          return direction === 1 ? firstTier - secondTier : secondTier - firstTier;
        }
      }
      if (a !== b) {
        const order = a > b ? -1 : 1;
        return !!typeSortMap[by]?.reverse === (direction === 1) ? order : -order;
      }
    }
    return 0;
  });
}

function missing(value: unknown, by: string) {
  return (
    value == null ||
    (typeof value === 'number' && (!Number.isFinite(value) || (by === 'date' && value <= 0)))
  );
}
