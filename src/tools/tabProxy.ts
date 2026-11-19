import type {ErrorObject} from 'serialize-error';

export type TabProxyMode = 'tab' | 'window';

export type TrackerRequestMode = 'direct' | 'tab';

export function readTrackerRequestMode(value: unknown): TrackerRequestMode | undefined {
  if (value === 'direct' || value === 'tab') return value;
}

export function readTabProxyMode(value: unknown): TabProxyMode {
  return value === 'window' ? 'window' : 'tab';
}

export interface TabProxyRequest {
  origin: string;
  approvedOrigin?: string;
  url: string;
  options: Pick<RequestInit, 'method' | 'headers' | 'body' | 'mode' | 'credentials'>;
  screenCorner?: {right: number; bottom: number};
}

export interface TabProxyResult {
  response: {
    url: string;
    status: number;
    statusText: string;
    headers: [string, string][];
  };
  base64: string;
}

export type TabProxyReply = {result: TabProxyResult} | {error: ErrorObject};

export const tabProxyPort = 'tab-proxy';
