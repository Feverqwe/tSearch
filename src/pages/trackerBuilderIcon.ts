import {type DefaultTreeAdapterTypes, parse} from 'parse5';

const maxBytes = 1024 * 1024;

export async function fetchTrackerIcon(
  value: string,
  signal: AbortSignal,
  redirect: RequestRedirect = 'follow',
) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
    throw iconError();
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(25_000)]),
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    redirect,
  });
  if (!response.ok || !response.body) throw iconError();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let bytes = 0;
  const reader = response.body.getReader();
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw iconError();
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return new Blob(chunks);
}

export async function detectTrackerIcon(html: string, address: string, signal: AbortSignal) {
  const page = URL.parse(address);
  if (!page || !['http:', 'https:'].includes(page.protocol) || signal.aborted) return;
  const root = parse(html).childNodes.find((node) => node.nodeName === 'html');
  const head =
    root && 'childNodes' in root
      ? root.childNodes.find((node) => node.nodeName === 'head')
      : undefined;
  const elements =
    head && 'childNodes' in head
      ? head.childNodes.filter((node): node is DefaultTreeAdapterTypes.Element => 'tagName' in node)
      : [];
  const attr = (node: DefaultTreeAdapterTypes.Element | undefined, name: string) =>
    node?.attrs.find((attribute) => attribute.name === name)?.value.trim();
  const sameOrigin = (value: string | undefined, base: URL) => {
    const url = value && URL.parse(value, base);
    return url &&
      url.protocol === page.protocol &&
      url.origin === page.origin &&
      !url.username &&
      !url.password
      ? url
      : undefined;
  };
  const base =
    sameOrigin(
      attr(
        elements.find((node) => node.tagName === 'base' && attr(node, 'href')),
        'href',
      ),
      page,
    ) ?? page;
  const candidates = new Set<string>();
  for (const node of elements) {
    if (node.tagName !== 'link') continue;
    const rel = attr(node, 'rel')?.toLowerCase().split(/\s+/) ?? [];
    if (!rel.includes('icon') && !rel.includes('apple-touch-icon')) continue;
    const url = sameOrigin(attr(node, 'href'), base);
    if (!url) continue;
    url.hash = '';
    candidates.add(url.href);
    if (candidates.size === 3) break;
  }
  candidates.add(new URL('/favicon.ico', page).href);
  for (const url of candidates) {
    if (signal.aborted) return;
    const attempt = AbortSignal.any([signal, AbortSignal.timeout(1200)]);
    try {
      const blob = await fetchTrackerIcon(url, attempt, 'error');
      return await decodeTrackerIcon(blob, attempt);
    } catch {
      // A missing or invalid image should not prevent tracker setup.
    }
  }
}

export async function decodeTrackerIcon(input: Blob, signal: AbortSignal) {
  if (!input.size || input.size > maxBytes) throw iconError();
  const bytes = new Uint8Array(await input.arrayBuffer());
  signal.throwIfAborted();
  const type = iconType(bytes);
  if (!type) throw iconError();
  const blob = new Blob([bytes], {type});
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    signal.throwIfAborted();
    if (!image.naturalWidth || !image.naturalHeight) throw iconError();
    return await toDataUrl(blob, signal);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function iconType(bytes: Uint8Array) {
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte))
    return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if ([0, 0, 1, 0].every((byte, index) => bytes[index] === byte)) return 'image/x-icon';
  const xml = new DOMParser().parseFromString(new TextDecoder().decode(bytes), 'image/svg+xml');
  if (
    xml.documentElement.localName === 'svg' &&
    xml.documentElement.namespaceURI === 'http://www.w3.org/2000/svg'
  ) {
    return 'image/svg+xml';
  }
}

function toDataUrl(blob: Blob, signal: AbortSignal) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    const abort = () => reader.abort();
    signal.addEventListener('abort', abort, {once: true});
    reader.onloadend = () => {
      signal.removeEventListener('abort', abort);
      if (!signal.aborted && typeof reader.result === 'string') resolve(reader.result);
      else reject(reader.error ?? signal.reason ?? iconError());
    };
    reader.readAsDataURL(blob);
  });
}

function iconError() {
  return new Error('Invalid tracker icon');
}
