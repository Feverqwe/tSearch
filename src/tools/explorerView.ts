export function clampPage(page: number, itemCount: number, pageSize: number) {
  return Math.max(0, Math.min(page, Math.ceil(itemCount / pageSize) - 1));
}

export function moveByKey<T>(
  items: readonly T[],
  key: string,
  direction: -1 | 1,
  getKey: (item: T) => string,
): T[] {
  const from = items.findIndex((item) => getKey(item) === key);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= items.length) return [...items];
  const ordered = [...items];
  [ordered[from], ordered[to]] = [ordered[to], ordered[from]];
  return ordered;
}

export function isWebAddress(value: string) {
  const url = URL.parse(value);
  return Boolean(
    url &&
    (url.protocol === 'https:' || url.protocol === 'http:') &&
    !url.username &&
    !url.password,
  );
}

export function replaceFavorite<T extends {url: string}>(
  items: readonly T[],
  originalUrl: string,
  update: T,
): T[] {
  if (update.url !== originalUrl && items.some(({url}) => url === update.url)) {
    throw new Error('FAVORITE_URL_CONFLICT');
  }
  if (!items.some(({url}) => url === originalUrl)) throw new Error('FAVORITE_MISSING');
  return items.map((item) => (item.url === originalUrl ? {...item, ...update} : item));
}
