export default function moveBetween<T>(items: readonly T[], item: T, previous?: T, next?: T) {
  const originalIndex = items.indexOf(item);
  if (originalIndex === -1) return [...items];
  const ordered = [...items];
  ordered.splice(originalIndex, 1);
  if (previous !== undefined && ordered.includes(previous)) {
    ordered.splice(ordered.indexOf(previous) + 1, 0, item);
  } else if (next !== undefined && ordered.includes(next)) {
    ordered.splice(ordered.indexOf(next), 0, item);
  } else {
    ordered.push(item);
  }
  return ordered;
}
