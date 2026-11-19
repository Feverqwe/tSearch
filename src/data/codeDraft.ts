import type {OptionalResultSelectorId, PipelineStep, Selector} from '../components/selectorTypes';
import getRandomColor from '../tools/getRandomColor.ts';
import {type TrackerRequestMode, readTrackerRequestMode} from '../tools/tabProxy.ts';

const searchDefaults = {
  url: '',
  method: 'GET' as 'GET' | 'POST',
  baseUrl: '',
  originUrl: '',
  headers: '',
  body: '',
  encoding: '',
  query: '',
  charset: '',
};
const descriptionDefaults = {
  icon: '',
  name: '',
  url: '',
  description: '',
  updateUrl: '',
  downloadUrl: '',
  version: '1.0',
};

export interface CodeDraft {
  id?: string;
  version: 3;
  type: 'kit';
  search: typeof searchDefaults;
  auth: {url: string; loginForm?: Selector};
  selectors: {
    row: Selector;
    title: Selector;
    url: Selector;
    skipFromStart: number;
    skipFromEnd: number;
  } & Partial<Record<OptionalResultSelectorId, Selector>>;
  description: typeof descriptionDefaults & {requestMode?: TrackerRequestMode};
}

const optionalFields: readonly OptionalResultSelectorId[] = [
  'categoryTitle',
  'categoryUrl',
  'size',
  'downloadUrl',
  'seeds',
  'peers',
  'date',
  'nextPageUrl',
];

export function createCodeDraft(): CodeDraft {
  return {
    version: 3,
    type: 'kit',
    search: {...searchDefaults},
    auth: {url: ''},
    selectors: {
      row: {selector: ''},
      title: {selector: '', pipeline: [{name: 'getText'}]},
      url: {selector: '', pipeline: [{name: 'getProp', args: ['href']}]},
      skipFromStart: 0,
      skipFromEnd: 0,
    },
    description: {...descriptionDefaults, icon: getRandomColor()},
  };
}

export function defaultPipeline(id: OptionalResultSelectorId): PipelineStep[] {
  if (id === 'size') return [{name: 'getText'}, {name: 'parseSize'}];
  if (id === 'seeds' || id === 'peers') return [{name: 'getText'}, {name: 'toInt'}];
  if (id.endsWith('Url')) return [{name: 'getProp', args: ['href']}];
  return [{name: 'getText'}];
}

export function parseCodeDraft(raw: string): CodeDraft {
  const code = JSON.parse(raw);
  if (
    !code ||
    (code.version !== undefined && code.version !== 3) ||
    (code.type !== undefined && code.type !== 'kit') ||
    typeof code.search?.url !== 'string'
  )
    throw new Error('Invalid tracker definition');
  const draft = createCodeDraft();
  const selectors = code.selectors;
  const toSelector = (value: unknown): Selector => {
    if (
      !value ||
      typeof value !== 'object' ||
      !('selector' in value) ||
      typeof value.selector !== 'string'
    )
      throw new Error('Invalid tracker selector');
    const pipeline = 'pipeline' in value ? value.pipeline : undefined;
    if (
      pipeline !== undefined &&
      (!Array.isArray(pipeline) ||
        pipeline.some(
          (method) =>
            typeof method?.name !== 'string' ||
            (method.args !== undefined &&
              (!Array.isArray(method.args) ||
                method.args.some(
                  (arg: unknown) => typeof arg !== 'string' && typeof arg !== 'number',
                ))),
        ))
    )
      throw new Error('Invalid tracker pipeline');
    return {selector: value.selector, pipeline: pipeline as PipelineStep[] | undefined};
  };
  draft.id = typeof code.id === 'string' ? code.id : undefined;
  draft.search = {...searchDefaults, ...copyStrings(searchDefaults, code.search)};
  if (draft.search.method !== 'POST') draft.search.method = 'GET';
  draft.description = {...draft.description, ...copyStrings(descriptionDefaults, code.description)};
  draft.description.requestMode = readTrackerRequestMode(code.description?.requestMode);
  draft.description.icon ||= getRandomColor();
  draft.description.version ||= '1.0';
  draft.auth.url = typeof code.auth?.url === 'string' ? code.auth.url : '';
  if (code.auth?.loginForm) draft.auth.loginForm = toSelector(code.auth.loginForm);
  draft.selectors = {
    row: toSelector(selectors?.row),
    title: toSelector(selectors?.title),
    url: toSelector(selectors?.url),
    skipFromStart: Number(selectors?.skipFromStart) || 0,
    skipFromEnd: Number(selectors?.skipFromEnd) || 0,
  };
  for (const key of optionalFields) {
    if (selectors[key] !== undefined) draft.selectors[key] = toSelector(selectors[key]);
  }
  return draft;
}

function copyStrings<T extends Record<string, string>>(defaults: T, input: unknown): Partial<T> {
  if (!input || typeof input !== 'object') return {};
  const source = input as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(defaults)
      .filter((key) => typeof source[key] === 'string')
      .map((key) => [key, source[key]]),
  ) as Partial<T>;
}

function normalizeSelector({selector, pipeline}: Selector) {
  return {
    selector,
    pipeline: pipeline?.length
      ? pipeline.map(({name, args}) => ({name, args: args?.length ? args : undefined}))
      : undefined,
  };
}

export function draftExtraction(code: CodeDraft) {
  const {row, title, url, skipFromStart, skipFromEnd} = code.selectors;
  const search: Pick<CodeDraft['search'], 'url' | 'method'> & Partial<CodeDraft['search']> = {
    ...code.search,
  };
  for (const key of [
    'baseUrl',
    'originUrl',
    'headers',
    'body',
    'encoding',
    'query',
    'charset',
  ] as const) {
    if (!search[key]) delete search[key];
  }
  const auth = {
    url: code.auth.url || undefined,
    loginForm: code.auth.loginForm?.selector ? normalizeSelector(code.auth.loginForm) : undefined,
  };
  const selectors = {
    row: normalizeSelector(row),
    skipFromStart: skipFromStart || undefined,
    skipFromEnd: skipFromEnd || undefined,
    title: normalizeSelector(title),
    url: normalizeSelector(url),
    ...Object.fromEntries(
      optionalFields.flatMap((key) => {
        const selector = code.selectors[key];
        return selector?.selector ? [[key, normalizeSelector(selector)]] : [];
      }),
    ),
  };
  return {search, auth: auth.url || auth.loginForm ? auth : undefined, selectors};
}

export function serializeCodeDraft(code: CodeDraft) {
  const description = {...code.description} as Partial<CodeDraft['description']>;
  for (const key of ['url', 'description', 'updateUrl', 'downloadUrl'] as const) {
    if (!description[key]) delete description[key];
  }
  return JSON.stringify({
    id: code.id,
    version: code.version,
    type: code.type,
    description,
    ...draftExtraction(code),
  });
}
