import type {SearchTemplate} from './types.ts';

export interface SearchEvidence {
  phrase?: string;
  requestUrl?: string;
  requestBody?: string;
}

type Search = SearchTemplate;
type Pairs = [string, string][];
type Source = 'request' | 'url' | 'form' | 'unknown';

const sensitive =
  /pass(?:word|key|wd)|csrf|xsrf|token|session|cookie|authorization|api[_-]?key|captcha|(?:^|[\W_])sid(?:$|[\W_])/i;
const searchName =
  /^(?:q|s|nm|pname|nmt|term|terms|keywords?|query|search(?:str(?:ing)?|text|query|term|name)?|nameTorrent)$/i;
const cue = /search|поиск|искать/i;
const placeholder = '%search%';

function asHttpUrl(value: string, base?: string) {
  try {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return;
    return url;
  } catch {
    return;
  }
}

function nameLooksLikeSearch(name: string) {
  return searchName.test(
    name
      .split(/[\[\]]+/)
      .filter(Boolean)
      .at(-1) ?? '',
  );
}

function templateParams(pairs: Pairs, phrase: string, name?: string) {
  if (pairs.some(([key]) => sensitive.test(key))) return;
  const exact = pairs
    .map(([key, value], index) =>
      phrase && value.trim() === phrase && (!name || key === name) ? index : -1,
    )
    .filter((index) => index >= 0);
  const recognizable = pairs
    .map(([key, value], index) =>
      (name ? key === name : nameLooksLikeSearch(key)) && (name || value.trim()) ? index : -1,
    )
    .filter((index) => index >= 0);
  const choices =
    exact.length > 1 && !name
      ? exact.filter((index) => nameLooksLikeSearch(pairs[index][0]))
      : exact.length
        ? exact
        : recognizable;
  if (choices.length !== 1) return;
  const [match] = choices;
  return pairs
    .map(
      ([key, value], index) =>
        new URLSearchParams([[key, '']]).toString() +
        (index === match ? placeholder : new URLSearchParams([['', value]]).toString().slice(1)),
    )
    .join('&');
}

function fromAddress(url: URL, phrase: string): Search | undefined {
  const pairs = [...url.searchParams];
  if (pairs.some(([name]) => sensitive.test(name))) return;
  const parameters = templateParams(pairs, phrase);
  if (parameters !== undefined) {
    return {method: 'GET', url: url.origin + url.pathname, query: parameters};
  }
  if (!phrase) return;
  const segments = url.pathname.split('/');
  const matches = segments.filter((part) => {
    try {
      return decodeURIComponent(part) === phrase;
    } catch {
      return false;
    }
  });
  if (matches.length === 1) {
    return {
      method: 'GET',
      url:
        url.origin +
        segments.map((part) => (part === matches[0] ? placeholder : part)).join('/') +
        url.search,
    };
  }
}

function searchForms(doc: Document, page: URL, phrase: string) {
  return [...doc.forms]
    .flatMap((form) => {
      if (
        form.querySelector('input[type="password"]') ||
        !['get', 'post'].includes(form.method) ||
        form.querySelector('[formaction], [formmethod], input[type="file"]')
      )
        return [];
      const action = asHttpUrl(form.getAttribute('action')?.trim() || page.href, doc.baseURI);
      if (!action || action.origin !== page.origin) return [];
      action.hash = '';
      if ([...action.searchParams.keys()].some((name) => sensitive.test(name))) return [];
      const fields = [...form.elements].filter(
        (element): element is HTMLInputElement =>
          element instanceof HTMLInputElement &&
          !!element.name &&
          !element.matches(':disabled') &&
          (element.type === 'search' ||
            (element.type === 'text' &&
              (nameLooksLikeSearch(element.name) ||
                cue.test(
                  [element.id, element.placeholder, element.getAttribute('aria-label')].join(' '),
                ) ||
                (!!phrase && element.value.trim() === phrase)))),
      );
      if (fields.length !== 1) return [];
      const [field] = fields;
      const score =
        Number(action.pathname === page.pathname) * 4 +
        Number(!!phrase && field.value.trim() === phrase) * 3 +
        Number(field.type === 'search') * 2 +
        Number(!!form.getAttribute('action') && !form.getAttribute('action')?.startsWith('#'));
      return [{form, action, field, score}];
    })
    .sort((a, b) => b.score - a.score);
}

export function inferSearch(
  doc: Document,
  page: URL,
  evidence: SearchEvidence,
): {search: Search; searchSource: Source} {
  const phrase = evidence.phrase?.trim() ?? '';
  const forms = searchForms(doc, page, phrase);
  const top = forms[0] && forms[0].score !== forms[1]?.score ? forms[0] : undefined;
  const explicitUrl = evidence.requestUrl?.trim();
  const address = explicitUrl ? asHttpUrl(explicitUrl) : undefined;
  const fallback = () => {
    const clean = new URL(page.href);
    clean.hash = '';
    for (const name of [...clean.searchParams.keys()]) {
      if (sensitive.test(name)) clean.searchParams.delete(name);
    }
    return {search: {url: clean.href}, searchSource: 'unknown' as const};
  };
  if (explicitUrl && !address) return fallback();

  const requestBody = evidence.requestBody?.trim();
  if (requestBody) {
    if (!requestBody.split('&').every((entry) => /^[^=&\s]+=[^\r\n]*$/.test(entry)))
      return fallback();
    const pairs = [...new URLSearchParams(requestBody)];
    const formName =
      top && top.form.method === 'post' && pairs.some(([name]) => name === top.field.name)
        ? top.field.name
        : undefined;
    const body = templateParams(pairs, phrase, formName);
    const target = address ?? (top?.form.method === 'post' ? top.action : page);
    if (
      body === undefined ||
      [...target.searchParams.keys()].some((name) => sensitive.test(name))
    ) {
      return fallback();
    }
    return {
      search: {url: target.origin + target.pathname + target.search, method: 'POST', body},
      searchSource: 'request',
    };
  }

  if (address || top?.form.method !== 'post') {
    const observed = fromAddress(address ?? page, phrase);
    if (observed) return {search: observed, searchSource: 'url'};
  }

  if (
    !top ||
    (top.form.method === 'post' && top.form.enctype !== 'application/x-www-form-urlencoded')
  ) {
    return fallback();
  }
  const data = [...new FormData(top.form)];
  if (data.some(([, value]) => typeof value !== 'string')) return fallback();
  const template = templateParams(data as Pairs, phrase, top.field.name);
  if (template === undefined) return fallback();
  const encoding = /^(?:windows-1251|cp1251)$/i.test(top.form.acceptCharset.trim())
    ? 'cp1251'
    : undefined;
  return {
    search:
      top.form.method === 'post'
        ? {url: top.action.href, method: 'POST', body: template, encoding}
        : {url: top.action.origin + top.action.pathname, method: 'GET', query: template, encoding},
    searchSource: 'form',
  };
}
