import {compareVersions} from 'compare-versions';

import type {KitSettings} from '../sandbox/exKitTracker';
import {readTrackerRequestMode, type TrackerRequestMode} from './tabProxy.ts';

interface TrackerDefinition extends KitSettings {
  version: 3;
  type: 'kit';
  description: {
    name: string;
    description?: string;
    icon?: string;
    url?: string;
    version?: string;
    updateUrl?: string;
    downloadUrl?: string;
    requestMode?: TrackerRequestMode;
  };
}

export function parseTrackerDefinition(text: string): TrackerDefinition {
  // Earlier releases saved JSON inside this generated wrapper.
  const wrapped =
    /^(?:[ \t]*(?:\/\/[^\r\n]*)?\r?\n)*[ \t]*const code = (\{[\s\S]*\});\s*API_exKit\(code\);\s*$/.exec(
      text,
    );
  const definition = JSON.parse(wrapped?.[1] ?? text);
  if (
    definition?.version !== 3 ||
    definition.type !== 'kit' ||
    typeof definition.description?.name !== 'string' ||
    typeof definition.search?.url !== 'string' ||
    typeof definition.selectors?.row?.selector !== 'string'
  ) {
    throw new Error('Expected a version 3 JSON tracker definition');
  }

  checkHttpUrl(definition.search.url);
  return definition;
}

export function prepareTrackerDefinition(text: string, sourceUrl?: string) {
  const definition = parseTrackerDefinition(text);
  const {name, description, icon, url, updateUrl, downloadUrl, version} = definition.description;
  const connect = trackerConnectOrigins(definition.search.url);
  const [origin] = connect;
  const trackerVersion = version || '1.0';
  compareVersions(trackerVersion, trackerVersion);
  return {
    code: JSON.stringify(definition, null, 2),
    meta: {
      name,
      description: typeof description === 'string' ? description : undefined,
      icon: typeof icon === 'string' ? icon : undefined,
      trackerURL: url ? checkHttpUrl(url).href : origin,
      updateURL: updateUrl ? checkHttpUrl(updateUrl).href : undefined,
      downloadURL: downloadUrl ? checkHttpUrl(downloadUrl).href : sourceUrl,
      version: trackerVersion,
      connect,
      require: ['exKit'],
      requestMode: readTrackerRequestMode(definition.description.requestMode),
    },
  };
}

export function trackerConnectOrigins(searchUrl: string) {
  const target = checkHttpUrl(searchUrl);
  const origins = [target.origin];
  if (target.protocol === 'http:') {
    const secure = new URL(target.origin);
    secure.protocol = 'https:';
    origins.push(secure.origin);
  }
  return origins;
}

function checkHttpUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Tracker URLs must use HTTP or HTTPS');
  }
  return url;
}
