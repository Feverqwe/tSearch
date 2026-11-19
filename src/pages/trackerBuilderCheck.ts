import {hasEmptyResultsNotice} from '../../packages/tracker-toolkit/src/inspection';
import {draftExtraction, type CodeDraft} from '../data/codeDraft';
import {extractionKey} from '../data/trackerBuilder';
import ExKitTracker, {
  buildNextSearchOptions,
  buildSearchOptions,
  type ExtractionIssue,
  type SearchSession,
} from '../sandbox/exKitTracker';
import exKitBuildConnectRe from '../tools/exKitBuildConnectRe';
import {trackerConnectOrigins} from '../tools/trackerDefinition';
import exKitRequestOptionsNormalize from '../tools/exKitRequestOptionsNormalize';
import type {TrackerRequestOptions, TrackerResponse} from '../tools/exKitRequest';

export function searchRequest(search: CodeDraft['search'], phrase: string, nextUrl?: string) {
  const options = nextUrl
    ? buildNextSearchOptions(search, nextUrl)
    : buildSearchOptions(search, phrase);
  return exKitRequestOptionsNormalize(options).options;
}

export const isRequired = (field: ExtractionIssue['field']) =>
  ['row', 'title', 'url'].includes(field);

export const blocksExport = ({field, blocking}: ExtractionIssue) =>
  Boolean(blocking || isRequired(field));

export function trackerConnectRule(code: CodeDraft) {
  return exKitBuildConnectRe(trackerConnectOrigins(code.search.url));
}

export function isSearchRequest(code: CodeDraft, phrase: string, sent: TrackerRequestOptions) {
  const configured = searchRequest(code.search, phrase);
  const connectRe = trackerConnectRule(code);
  if (
    [configured.url, configured.originUrl].some(
      (url) => url && !connectRe?.test(new URL(url).origin),
    )
  ) {
    return false;
  }
  function signature({url, method, body, headers, charset, originUrl}: TrackerRequestOptions) {
    const target = new URL(url);
    target.hash = '';
    return JSON.stringify([
      target.href,
      method,
      body || '',
      [...new Headers(headers)],
      charset || '',
      code.description.requestMode === 'tab' ? originUrl || target.origin : '',
    ]);
  }
  return signature(configured) === signature(sent);
}

export async function checkTracker(
  code: CodeDraft,
  phrase: string,
  response: TrackerResponse,
  requestVerified = true,
) {
  const tracker = new ExKitTracker();
  const issues: ExtractionIssue[] = [];
  await tracker.init(draftExtraction(code), issues);
  const session: SearchSession = {tracker, event: 'search', request: null, response};
  const parsed = tracker.parseResponse(session, response, issues);
  const emptySource = Boolean(
    session.doc &&
    issues.some(({field, reason}) => field === 'row' && reason === 'no_match') &&
    hasEmptyResultsNotice(session.doc),
  );
  const nextPageUrl = parsed.nextPageUrl;
  const next =
    nextPageUrl && withoutHash(nextPageUrl) !== withoutHash(response.url) ? nextPageUrl : null;
  return {
    ...parsed,
    emptySource,
    nextPageUrl: next,
    response,
    requestVerified,
    issues: issues.filter(
      ({field, reason}) =>
        reason !== 'no_match' || (field !== 'nextPageUrl' && !(field === 'row' && emptySource)),
    ),
    key: extractionKey(code, phrase),
    passed: Boolean(parsed.results.length) && !issues.some(blocksExport),
  };
}

function withoutHash(value: string) {
  const url = new URL(value);
  url.hash = '';
  url.searchParams.sort();
  return url.href;
}

export type CheckResult = Awaited<ReturnType<typeof checkTracker>>;
