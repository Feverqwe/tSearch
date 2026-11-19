import qs from 'querystring-es3';

import type {TrackerRequestOptions} from './exKitRequest';

type FormData = Parameters<typeof qs.stringify>[0];

export interface RawRequestOptions extends Omit<TrackerRequestOptions, 'body'> {
  type?: string;
  body?: string | FormData | null;
  data?: string | FormData;
  query?: string | FormData;
  json?: boolean;
}

export default function exKitRequestOptionsNormalize(raw: string | RawRequestOptions) {
  const {
    type,
    method,
    data,
    body,
    query,
    json,
    url,
    headers: rawHeaders,
    ...rest
  } = typeof raw === 'string' ? {url: raw} : raw;
  const requestMethod = (type || method || 'GET').toUpperCase();
  const requestQuery = requestMethod !== 'POST' && data ? data : query;
  const requestBody =
    requestMethod === 'GET' || requestMethod === 'HEAD'
      ? undefined
      : requestMethod === 'POST' && data
        ? data
        : body;
  const headers = new Headers(rawHeaders);
  if (requestBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  }
  const contentType = headers.get('Content-Type') ?? '';
  const queryString = requestQuery
    ? typeof requestQuery === 'string'
      ? requestQuery
      : qs.stringify(requestQuery)
    : '';
  const encodedBody =
    typeof requestBody === 'object' && requestBody !== null
      ? contentType.startsWith('application/json')
        ? JSON.stringify(requestBody)
        : qs.stringify(requestBody)
      : requestBody;
  const options: TrackerRequestOptions = {
    ...rest,
    url: queryString ? appendQuery(url, queryString) : url,
    method: requestMethod,
    body: encodedBody,
    headers: Array.from(headers.entries()),
  };
  return {options, toJson: json};
}

function appendQuery(url: string, query: string) {
  const hashIndex = url.indexOf('#');
  const address = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : url.slice(hashIndex);
  return address + (address.includes('?') ? '&' : '?') + query + fragment;
}
