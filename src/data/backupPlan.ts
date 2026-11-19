import JSZip from 'jszip';

export type BackupArea = 'local' | 'sync';
type Entries = Record<string, unknown>;

export interface BackupPlan {
  local: Entries;
  sync: Entries;
  skipped: string[];
}

const areaOf = new Map<string, BackupArea>([
  ...['options', 'profiles', 'explorerFavorites', 'explorerSections'].map(
    (key): [string, BackupArea] => [key, 'sync'],
  ),
  ...[
    'history',
    'profileId',
    'trackers',
    'explorerModules',
    'explorerCache',
    'quickSearch',
    'lastCheckUpdateAt',
    'qualitySettings',
  ].map((key): [string, BackupArea] => [key, 'local']),
]);

const maxZipBytes = 16 * 1024 * 1024;
const maxUnpackedBytes = 24 * 1024 * 1024;

export async function createBackup(storage: Record<BackupArea, Entries>) {
  const zip = new JSZip();
  const encoder = new TextEncoder();
  let unpackedBytes = 0;
  for (const [key, area] of areaOf) {
    const json = JSON.stringify(storage[area][key]);
    if (json === undefined) continue;
    const bytes = encoder.encode(json);
    unpackedBytes += bytes.length;
    if (unpackedBytes > maxUnpackedBytes) throw new Error('ZIP_TOO_LARGE');
    zip.file(`${area}/${key}.json`, bytes);
  }
  if (!Object.keys(zip.files).length) throw new Error('ZIP_NO_SUPPORTED_ENTRIES');
  const blob = await zip.generateAsync({type: 'blob', compression: 'DEFLATE'});
  if (blob.size > maxZipBytes) throw new Error('ZIP_TOO_LARGE');
  return blob;
}

export async function planBackup(file: Blob | Uint8Array): Promise<BackupPlan> {
  if ((file instanceof Blob ? file.size : file.byteLength) > maxZipBytes) {
    throw new Error('ZIP_TOO_LARGE');
  }
  const zip = await JSZip.loadAsync(file instanceof Blob ? await file.arrayBuffer() : file);
  const files = Object.values(zip.files);
  if (files.length > 512) throw new Error('ZIP_TOO_LARGE');
  let remaining = maxUnpackedBytes;
  const plan: BackupPlan = {local: {}, sync: {}, skipped: []};
  for (const entry of files) {
    const name = entry.unsafeOriginalName ?? entry.name;
    if (entry.dir) {
      if (!/^(local|sync)\/$/.test(name)) throw new Error('ZIP_INVALID_PATH');
      continue;
    }
    const fileMatch = /^(?:(local|sync)\/)?([a-z][a-z\d_-]*)\.json$/i.exec(name);
    if (!fileMatch || entry.name !== name) throw new Error('ZIP_INVALID_PATH');
    const [, explicitArea, key] = fileMatch;
    const area = areaOf.get(key);
    const stored = await readEntry(entry, remaining);
    remaining -= stored.length;
    const value: unknown = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(stored));
    if (!area || (explicitArea && explicitArea !== area)) {
      plan.skipped.push(name);
      continue;
    }
    if (Object.hasOwn(plan[area], key)) throw new Error('ZIP_DUPLICATE_KEY');
    plan[area][key] = value;
  }
  if (!Object.keys(plan.local).length && !Object.keys(plan.sync).length) {
    throw new Error('ZIP_NO_SUPPORTED_ENTRIES');
  }
  return plan;
}

function readEntry(entry: JSZip.JSZipObject, limit: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    // JSZip exposes streaming decompression on entries, but its type declarations omit it.
    const source = entry as JSZip.JSZipObject & {
      internalStream(type: 'uint8array'): JSZip.JSZipStreamHelper<Uint8Array>;
    };
    const stream = source.internalStream('uint8array');
    const chunks: Uint8Array[] = [];
    let length = 0;
    stream.on('data', (chunk) => {
      length += chunk.length;
      if (length > limit) {
        stream.pause();
        reject(new Error('ZIP_TOO_LARGE'));
      } else {
        chunks.push(chunk);
      }
    });
    stream.on('error', reject);
    stream.on('end', () => {
      const data = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.length;
      }
      resolve(data);
    });
    stream.resume();
  });
}

export interface BackupStorage {
  get(area: BackupArea, keys: string[]): Promise<Entries>;
  set(area: BackupArea, entries: Entries): Promise<void>;
  remove(area: BackupArea, keys: string[]): Promise<void>;
}

export class BackupWriteError extends Error {
  readonly retryRestore?: () => Promise<void>;

  constructor(retryRestore?: () => Promise<void>) {
    super(retryRestore ? 'ZIP_PARTIAL_WRITE' : 'ZIP_WRITE_FAILED');
    this.retryRestore = retryRestore;
  }
}

function sameStoredValue(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (
    !left ||
    !right ||
    typeof left !== 'object' ||
    typeof right !== 'object' ||
    Array.isArray(left) !== Array.isArray(right)
  )
    return false;
  const leftEntries = Object.entries(left);
  return (
    leftEntries.length === Object.keys(right).length &&
    leftEntries.every(
      ([key, value]) =>
        Object.hasOwn(right, key) && sameStoredValue(value, Reflect.get(right, key)),
    )
  );
}

export async function writeBackup(plan: BackupPlan, storage: BackupStorage) {
  const areas = (['local', 'sync'] as const).filter((area) => Object.keys(plan[area]).length > 0);
  const previous = await Promise.all(
    areas.map((area) => storage.get(area, Object.keys(plan[area]))),
  );
  const touched: typeof areas = [];
  const restore = async () => {
    const checks = await Promise.allSettled(
      touched.map(async (area) => {
        const original = previous[areas.indexOf(area)];
        const keys = Object.keys(plan[area]);
        const current = await storage.get(area, keys);
        const replaced = keys.filter(
          (key) => Object.hasOwn(current, key) && sameStoredValue(current[key], plan[area][key]),
        );
        const reset = Object.fromEntries(
          replaced
            .filter(
              (key) =>
                Object.hasOwn(original, key) && !sameStoredValue(original[key], current[key]),
            )
            .map((key) => [key, original[key]]),
        );
        const added = replaced.filter((key) => !Object.hasOwn(original, key));
        if (Object.keys(reset).length) await storage.set(area, reset);
        if (added.length) await storage.remove(area, added);
      }),
    );
    if (checks.some(({status}) => status === 'rejected')) throw new Error('ZIP_ROLLBACK_FAILED');
  };

  try {
    for (const area of areas) {
      touched.push(area);
      await storage.set(area, plan[area]);
    }
  } catch {
    try {
      await restore();
    } catch {
      throw new BackupWriteError(restore);
    }
    throw new BackupWriteError();
  }
}
