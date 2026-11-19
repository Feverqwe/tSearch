import getTrackerCodeMeta from './getTrackerCodeMeta';
import storageGet from './storageGet';

export function isTrackerScript(code: string) {
  return /^\s*\/\/\s*==UserScript==\s*$/m.test(code);
}

export function prepareTrackerScript(code: string) {
  if (!isTrackerScript(code)) throw new Error('Expected a tracker script with UserScript metadata');
  const {name, version, description, author, icon, icon64, trackerURL, requestMode} =
    getTrackerCodeMeta(code);
  const site = new URL(trackerURL ?? '');
  if (site.protocol !== 'http:' && site.protocol !== 'https:') {
    throw new Error('Expected an HTTP or HTTPS tracker URL');
  }
  return {
    code,
    meta: {
      name,
      version,
      description,
      author,
      icon,
      icon64,
      trackerURL: site.href,
      requestMode,
      connect: [site.origin],
      require: ['exKit'],
    },
  };
}

export async function trackerScriptDigest(code: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(code)),
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function readTrackerScriptApprovals() {
  const {trackerScriptApprovals} = await storageGet({
    trackerScriptApprovals: {} as Record<string, string>,
  });
  return trackerScriptApprovals;
}
