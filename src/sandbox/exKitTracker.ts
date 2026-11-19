import {sizzleQuerySelector, sizzleQuerySelectorAll} from '../tools/sizzleQuery';
import encodeCp1251 from '../tools/encodeCp1251';
import exKitGetDoc from '../tools/exKitGetDoc';
import exKitNormalizeUrl from '../tools/exKitNormalizeUrl';
import {isNumber, isString} from '../tools/assertType';
import {compilePipeline, PipelineError} from '../tools/trackerPipeline';
import type {TrackerRequestOptions, TrackerResponse} from '../tools/exKitRequest';

const resultFields = [
  'categoryTitle',
  'categoryUrl',
  'title',
  'url',
  'size',
  'downloadUrl',
  'seeds',
  'peers',
  'date',
] as const;
type ResultField = (typeof resultFields)[number];
type Field = ResultField | 'nextPageUrl';
export interface ExtractionIssue {
  field: Field | 'row' | 'loginForm';
  reason: 'selector' | 'no_match' | 'pipeline' | 'value' | 'link';
  row?: number;
  step?: number;
  detail?: string;
  blocking?: boolean;
}

const numericFields = new Set<Field>(['size', 'seeds', 'peers', 'date']);
const linkFields = new Set<Field>(['categoryUrl', 'url', 'downloadUrl', 'nextPageUrl']);

interface PipelineStep {
  name: string;
  args?: unknown[];
}
type Pipeline = (value: unknown) => unknown;

interface Selector {
  selector: string;
  pipeline?: PipelineStep[];
}
type FieldSelectors = Partial<Record<Field, Selector>>;
type SearchOptions = Omit<TrackerRequestOptions, 'headers'> & {
  query?: string;
  headers?: HeadersInit;
};

export interface KitSettings {
  search: {
    url: string;
    method?: string;
    encoding?: string;
    originUrl?: string;
    query?: string;
    body?: string;
    charset?: string;
    headers?: string;
  };
  selectors: FieldSelectors & {row: Selector; skipFromStart?: number; skipFromEnd?: number};
  auth?: {url?: string; loginForm?: Selector};
  hooks?: {
    onGetDoc?: (session: SearchSession, document: Document) => void;
    onBeforeRequest?: (session: SearchSession, options: SearchOptions) => void;
    onAfterRequest?: (session: SearchSession, response: TrackerResponse) => void;
    transform?: Partial<
      Record<Field, (session: SearchSession, value: unknown, row: ParentNode) => unknown>
    >;
  };
}

export interface SearchSession {
  tracker: ExKitTracker;
  event: string;
  request: unknown;
  response?: TrackerResponse;
  doc?: Document;
}

declare function API_request(options: SearchOptions): Promise<TrackerResponse>;

export default class ExKitTracker {
  private code!: KitSettings;
  private pipelines = new Map<Selector, Pipeline>();
  private invalidPipelines = new Set<Selector>();

  async init(code: KitSettings, issues?: ExtractionIssue[]) {
    this.code = code;
    this.pipelines.clear();
    this.invalidPipelines.clear();
    const selectors = code.selectors;
    const fields = ['row', ...resultFields, 'nextPageUrl'] as const;
    const failures = await Promise.all(
      fields.map(async (field) => {
        const selector = selectors[field];
        if (!selector?.pipeline?.length) return;
        try {
          this.pipelines.set(selector, await compilePipeline(selector.pipeline));
        } catch (error) {
          if (!issues) throw error;
          this.invalidPipelines.add(selector);
          return {...extractionIssue(field, new FieldError('pipeline', error)), blocking: true};
        }
      }),
    );
    for (const issue of failures) {
      if (issue) issues?.push(issue);
    }
  }

  search(session: SearchSession, query: string) {
    return this.request(session, buildSearchOptions(this.code.search, query));
  }

  searchNext(session: SearchSession, url: string) {
    return this.request(session, buildNextSearchOptions(this.code.search, url));
  }

  parseResponse(session: SearchSession, response: TrackerResponse, issues?: ExtractionIssue[]) {
    const doc: Document = exKitGetDoc(response.body, response.url);
    session.doc = doc;

    const {auth, hooks, selectors} = this.code;
    hooks?.onGetDoc?.(session, doc);

    if (auth?.loginForm && (!issues || auth.loginForm.selector)) {
      let needsLogin = false;
      try {
        needsLogin = Boolean(sizzleQuerySelector(doc, auth.loginForm.selector));
      } catch (error) {
        if (!issues) throw error;
        issues.push({field: 'loginForm', reason: 'selector', blocking: true});
      }
      if (needsLogin) {
        throw Object.assign(new Error('Auth required'), {code: 'AUTH_REQUIRED', url: auth.url});
      }
    }

    let rows: Element[];
    try {
      rows = sizzleQuerySelectorAll(doc, selectors.row.selector);
    } catch (error) {
      if (!issues) throw error;
      issues.push({field: 'row', reason: selectors.row.selector ? 'selector' : 'no_match'});
      return {results: [], nextPageUrl: null};
    }
    if (selectors.skipFromStart) rows.splice(0, selectors.skipFromStart);
    if (selectors.skipFromEnd) rows.splice(-selectors.skipFromEnd);

    if (issues && !rows.length) issues.push({field: 'row', reason: 'no_match'});
    const results = rows.flatMap((row, index) => {
      try {
        return [this.parseRow(session, row, issues, index + 1)];
      } catch (error) {
        if (!issues) console.error('Unable to parse tracker result', error);
        return [];
      }
    });

    let nextPageUrl: string | null = null;
    if (
      selectors.nextPageUrl &&
      (!issues || selectors.nextPageUrl.selector) &&
      !this.invalidPipelines.has(selectors.nextPageUrl)
    ) {
      try {
        nextPageUrl = String(
          this.readField(
            session,
            doc,
            'nextPageUrl',
            selectors.nextPageUrl,
            undefined,
            Boolean(issues),
          ),
        );
      } catch (error) {
        if (issues) issues.push(extractionIssue('nextPageUrl', error));
        else console.warn('Unable to read next page', error);
      }
    }
    return {results, nextPageUrl};
  }

  private parseRow(
    session: SearchSession,
    row: Element,
    issues?: ExtractionIssue[],
    rowNumber?: number,
  ) {
    const result: Partial<Record<ResultField, number | string>> = {};
    const cache = new Map<string, Node | null>();
    const errors = [];
    for (const field of resultFields) {
      const selector = this.code.selectors[field];
      if (!selector || (issues && !selector.selector)) {
        if (field === 'title' || field === 'url')
          issues?.push({field, row: rowNumber, reason: 'no_match'});
        continue;
      }
      if (this.invalidPipelines.has(selector)) continue;
      try {
        result[field] = this.readField(session, row, field, selector, cache, Boolean(issues));
      } catch (error) {
        errors.push({field, error});
        issues?.push({...extractionIssue(field, error), row: rowNumber});
      }
    }

    if (
      typeof result.title !== 'string' ||
      !result.title ||
      typeof result.url !== 'string' ||
      !result.url
    ) {
      throw Object.assign(new Error('A tracker result requires a title and URL'), {errors});
    }
    if (!issues && errors.length) console.warn('Some tracker fields could not be parsed', errors);
    return {
      ...result,
      title: result.title,
      url: result.url,
      date: result.date || -1,
    };
  }

  private readField(
    session: SearchSession,
    container: ParentNode,
    field: Field,
    selector: Selector,
    cache = new Map<string, Node | null>(),
    diagnose = false,
  ): string | number {
    if (!cache.has(selector.selector)) {
      try {
        cache.set(selector.selector, sizzleQuerySelector(container, selector.selector));
      } catch (error) {
        throw diagnose ? new FieldError('selector', error) : error;
      }
    }

    let value: unknown = cache.get(selector.selector);
    if (diagnose && !value) throw new FieldError('no_match');
    const pipeline = this.pipelines.get(selector);
    try {
      if (pipeline) value = pipeline(value);
    } catch (error) {
      throw diagnose ? new FieldError('pipeline', error) : error;
    }
    const transform = this.code.hooks?.transform?.[field];
    if (transform) value = transform(session, value, container);

    if (numericFields.has(field)) {
      return isNumber(typeof value === 'number' ? value : Number.parseInt(isString(value), 10));
    }
    const text = isString(value);
    if (diagnose && !text.trim()) throw new FieldError('value');
    if (!linkFields.has(field)) return text;
    const link = exKitNormalizeUrl(session.response!.url, text);
    if (diagnose) {
      try {
        if (/\s/.test(text.trim())) throw new Error();
        const protocol = new URL(link).protocol;
        if (
          protocol !== 'http:' &&
          protocol !== 'https:' &&
          !(field === 'downloadUrl' && protocol === 'magnet:')
        )
          throw new Error();
      } catch {
        throw new FieldError('link');
      }
    }
    return link;
  }

  private async request(session: SearchSession, options: SearchOptions) {
    this.code.hooks?.onBeforeRequest?.(session, options);
    const response = await API_request(options);
    session.response = response;
    this.code.hooks?.onAfterRequest?.(session, response);
    return response;
  }
}

export function buildSearchOptions(search: KitSettings['search'], query: string): SearchOptions {
  const encoded = search.encoding === 'cp1251' ? encodeCp1251(query) : encodeURIComponent(query);
  return {
    method: search.method,
    url: search.url.replaceAll('%search%', encoded),
    originUrl: search.originUrl,
    query: search.query?.replaceAll('%search%', encoded),
    body: search.body?.replaceAll('%search%', encoded),
    charset: search.charset,
    headers: search.headers ? JSON.parse(search.headers) : undefined,
  };
}

export function buildNextSearchOptions(search: KitSettings['search'], url: string): SearchOptions {
  return {
    method: 'GET',
    url,
    originUrl: search.originUrl,
    charset: search.charset,
    headers: search.headers ? JSON.parse(search.headers) : undefined,
  };
}

class FieldError extends Error {
  constructor(
    readonly reason: ExtractionIssue['reason'],
    cause?: unknown,
  ) {
    super(undefined, {cause});
  }
}

function extractionIssue(field: ExtractionIssue['field'], error: unknown): ExtractionIssue {
  const detail = error instanceof FieldError ? error.cause : error;
  return {
    field,
    reason: error instanceof FieldError ? error.reason : 'value',
    detail: detail instanceof Error ? detail.message : undefined,
    step: detail instanceof PipelineError ? detail.step : undefined,
  };
}
