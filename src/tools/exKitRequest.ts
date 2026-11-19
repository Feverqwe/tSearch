import {parse as parseContentType} from 'content-type';
import {deserializeError} from 'serialize-error';

import {ErrorWithCode, StatusCodeError} from './errors';
import base64ToArrayBuffer from './base64ToArrayBuffer';
import {
  tabProxyPort,
  type TabProxyReply,
  type TabProxyRequest,
  type TrackerRequestMode,
} from './tabProxy';

export interface TrackerRequestOptions {
  url: string;
  credentials?: RequestCredentials;
  originUrl?: string;
  charset?: string;
  method?: string;
  headers?: HeadersInit;
  body?: string | null;
}

export interface TrackerResponse {
  url: string;
  statusCode: number;
  statusText: string;
  body: string;
  headers: Record<string, string>;
}

interface BufferedResponse {
  response: Pick<Response, 'headers' | 'status' | 'statusText' | 'url'>;
  arrayBuffer: ArrayBuffer;
}

type AbortableRequest = Promise<BufferedResponse> & {abort: () => void};

export interface TrackerRequestContext {
  connectRe: RegExp | null;
  origin?: string;
  requests: AbortableRequest[];
  profileOptions: {enableProxy?: boolean};
  requestMode?: TrackerRequestMode;
}

export default async function exKitRequest(
  tracker: TrackerRequestContext,
  options: TrackerRequestOptions,
): Promise<TrackerResponse> {
  if (!options || typeof options.url !== 'string') {
    throw new ErrorWithCode('Tracker request URL is missing', 'INCORRECT_REQUEST');
  }
  const {url, charset, originUrl, ...fetchOptions} = options;
  const origin = allowedOrigin(url, tracker.connectRe);
  const tabOrigin = originUrl ? allowedOrigin(originUrl, tracker.connectRe) : origin;
  if (tracker.origin && (origin !== tracker.origin || tabOrigin !== tracker.origin)) {
    throw new ErrorWithCode(
      'Connection is outside the approved tracker origin',
      'ORIGIN_IS_NOT_AVAILABLE',
    );
  }

  const enableProxy = tracker.profileOptions.enableProxy ?? tracker.requestMode === 'tab';
  // Imported scripts may supply request data, but only the broker chooses fetch policy.
  const requestOptions: RequestInit = tracker.origin
    ? {
        method: options.method,
        headers: options.headers,
        body: options.body,
        credentials: options.credentials === 'omit' ? 'omit' : 'same-origin',
      }
    : fetchOptions;
  const request = enableProxy
    ? tabFetchRequest({
        origin: originUrl || origin,
        approvedOrigin: tracker.origin,
        url,
        options: requestOptions,
      })
    : fetchRequest(url, requestOptions, tracker.origin);

  tracker.requests.push(request);
  try {
    const {response, arrayBuffer} = await request;
    if (tracker.origin && new URL(response.url).origin !== tracker.origin) {
      throw new ErrorWithCode(
        'Response is outside the approved tracker origin',
        'ORIGIN_IS_NOT_AVAILABLE',
      );
    }
    const decoder = new TextDecoder(charset || responseCharset(response.headers) || 'utf-8');
    return {
      url: response.url,
      statusCode: response.status,
      statusText: response.statusText,
      body: decoder.decode(arrayBuffer),
      headers: Object.fromEntries(response.headers),
    };
  } finally {
    const index = tracker.requests.indexOf(request);
    if (index !== -1) tracker.requests.splice(index, 1);
  }
}

function allowedOrigin(value: string, connect: RegExp | null) {
  const {origin, protocol} = new URL(value);
  if ((protocol !== 'http:' && protocol !== 'https:') || !connect?.test(origin)) {
    throw new ErrorWithCode(
      `Connection to ${origin} is outside @connect`,
      'ORIGIN_IS_NOT_AVAILABLE',
    );
  }
  return origin;
}

function responseCharset(headers: Headers) {
  const contentType = headers.get('Content-Type');
  if (!contentType) return;
  try {
    return parseContentType(contentType).parameters.charset;
  } catch (error) {
    console.warn('Invalid tracker Content-Type', error);
  }
}

function tabFetchRequest(request: TabProxyRequest): AbortableRequest {
  const display = screen as Screen & {availLeft?: number; availTop?: number};
  const screenCorner = {
    right: (display.availLeft ?? 0) + display.availWidth,
    bottom: (display.availTop ?? 0) + display.availHeight,
  };
  const port = chrome.runtime.connect({name: tabProxyPort});
  const heartbeat = setInterval(() => port.postMessage(null), 20_000);
  let rejectRequest: (reason: unknown) => void;
  let connected = true;

  function close() {
    if (!connected) return;
    connected = false;
    clearInterval(heartbeat);
    port.disconnect();
  }

  const promise = new Promise<BufferedResponse>((resolve, reject) => {
    rejectRequest = reject;
    port.onDisconnect.addListener(() => {
      connected = false;
      clearInterval(heartbeat);
      reject(new Error(chrome.runtime.lastError?.message || 'Tracker request disconnected'));
    });
    port.onMessage.addListener((reply: TabProxyReply) => {
      close();
      if ('error' in reply) {
        reject(deserializeError(reply.error));
      } else {
        const {response, base64} = reply.result;
        resolve({
          response: {...response, headers: new Headers(response.headers)},
          arrayBuffer: base64ToArrayBuffer(base64),
        });
      }
    });
    port.postMessage({...request, screenCorner});
  });

  return Object.assign(promise, {
    abort() {
      close();
      rejectRequest(new DOMException('Request aborted', 'AbortError'));
    },
  });
}

function fetchRequest(
  url: string,
  options: RequestInit,
  approvedOrigin?: string,
): AbortableRequest {
  const controller = new AbortController();
  const request = (async () => {
    const init = {...options, signal: controller.signal};
    const frame = approvedOrigin?.startsWith('https:') ? document.createElement('iframe') : null;
    if (frame) {
      frame.hidden = true;
      document.body.append(frame);
    }
    try {
      let response: Response;
      if (frame) {
        // Chrome applies the frame's policy before sending each redirect hop.
        const policy = frame.contentDocument!.createElement('meta');
        policy.httpEquiv = 'Content-Security-Policy';
        policy.content = `connect-src ${approvedOrigin}`;
        frame.contentDocument!.head.append(policy);
        response = await frame.contentWindow!.fetch(url, init);
      } else {
        // CSP HTTP sources also allow HTTPS upgrades. Keep exact-origin checks for HTTP.
        response = await fetch(url, approvedOrigin ? {...init, redirect: 'error'} : init);
      }
      if (!response.ok) throw new StatusCodeError(response.status, null, null, response);
      const {headers, status, statusText, url: responseUrl} = response;
      return {
        response: {headers: new Headers(headers), status, statusText, url: responseUrl},
        arrayBuffer: await response.arrayBuffer(),
      };
    } finally {
      frame?.remove();
    }
  })();
  return Object.assign(request, {abort: () => controller.abort()});
}
