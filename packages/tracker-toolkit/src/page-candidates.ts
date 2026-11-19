import {sizzleQuerySelectorAll} from '../../../src/tools/sizzleQuery.ts';
import nextPageAfterCurrent from './next-page-after-current.ts';

export const pageFields = ['name', 'description', 'loginUrl', 'nextPageUrl'] as const;
export type PageField = (typeof pageFields)[number];
interface Rule {
  selector: string;
  pipeline: {name: string; args?: string[]}[];
}
export interface PageCandidate {
  value: string;
  features: string[];
  rule?: Rule;
  stable?: boolean;
  observedNext?: boolean;
}
export type PageCandidates = Record<PageField, PageCandidate[]>;
type Rank = (field: string, candidates: PageCandidate[]) => (PageCandidate & {score: number})[];
const text = (node: Element | null) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const pagination =
  '.pagination, .pager, .pages, .pg, .pagelist, .pagenav, [class*="pagin" i], [id*="pagin" i], nav[aria-label*="pag" i]';
const nextLabel =
  /^(?:next(?:\s+page)?|older(?:\s+(?:posts|results))?|далее|впер[её]д|след(?:ующая|ующую|\.)?(?:\s+страниц[ауы])?|наступна(?:\s+сторінка)?|далі|[›»→>]+)[\s›»→>]*$/i;
const currentSelector = '[aria-current="page"], .current, .active, .selected, strong, b, span';
const markerClass = /^(?:next|next[-_]page|page[-_]next)$/i;

function linkUrl(node: Element, page: URL) {
  const href = node.getAttribute('href')?.trim();
  if (!href || href.startsWith('#')) return;
  try {
    const url = new URL(href, node.ownerDocument.baseURI);
    if (
      url.origin !== page.origin ||
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return;
    if (
      [...url.searchParams.keys()].some((key) =>
        /pass|token|session|csrf|xsrf|captcha|^sid$/i.test(key),
      )
    )
      return;
    return url;
  } catch {
    return;
  }
}
function forward(url: URL, page: URL) {
  const address = (value: URL) => {
    const normalized = new URL(value);
    normalized.hash = '';
    normalized.searchParams.sort();
    return normalized.href;
  };
  if (address(url) === address(page)) return false;
  for (const key of ['page', 'p', 'pg', 'start', 'offset']) {
    const target = url.searchParams.get(key),
      current = page.searchParams.get(key);
    if (
      target !== null &&
      /^\d+$/.test(target) &&
      (current === null || /^\d+$/.test(current)) &&
      target !== current &&
      Number(target) <= Number(current ?? 0)
    )
      return false;
  }
  return true;
}
function address(value: URL) {
  const normalized = new URL(value);
  normalized.hash = '';
  normalized.searchParams.sort();
  return normalized.href;
}
function features(node: Element) {
  const values = [
    text(node),
    node.getAttribute('title') ?? '',
    node.getAttribute('aria-label') ?? '',
  ];
  const words =
    values
      .join(' ')
      .toLowerCase()
      .match(/[\p{L}]+/gu) ?? [];
  const known =
    /^(?:next|page|older|previous|prev|last|first|login|log|sign|in|out|logout|signin|register|далее|следующая|след|вперёд|вперед|назад|последняя|войти|вход|выход|выйти|авторизация|наступна|далі|увійти|вхід)$/;
  return [
    'bias',
    `tag:${node.localName}`,
    ...['name', 'property', 'rel'].flatMap((key) =>
      (node.getAttribute(key) ?? '')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((value) => `${key}:${value}`),
    ),
    ...words.filter((word) => known.test(word)).map((word) => `text:${word}`),
    ...[...node.classList]
      .filter((name) =>
        /next|prev|disabled|active|current|login|auth|description|logo|site|brand|advert|banner/i.test(
          name,
        ),
      )
      .map((name) => `class:${name.toLowerCase()}`),
    node.closest('header') ? 'inside:header' : '',
    node.closest('nav') ? 'inside:nav' : '',
    node.closest(pagination) ? 'inside:pagination' : '',
    values.some((value) => nextLabel.test(value)) ? 'label:next' : '',
    values.some((value) =>
      /^(?:log\s*in|sign\s*in|войти|вход|авторизация|увійти|вхід)$/i.test(value),
    )
      ? 'label:login'
      : '',
    /^[\d\s]+$/.test(text(node)) ? 'label:number' : '',
    node.closest('[aria-disabled="true"], [disabled], .disabled') ? 'disabled' : '',
    `length:${Math.min(4, Math.floor((node.getAttribute('content') ?? text(node)).length / 40))}`,
  ].filter(Boolean);
}

export function inspectPageDetails(
  doc: Document,
  page: URL,
  path: (node: Element) => string,
): PageCandidates {
  const candidates: PageCandidates = {name: [], description: [], loginUrl: [], nextPageUrl: []};
  for (const node of doc.querySelectorAll(
    'title, meta[content], h1, header img[alt], p.description',
  )) {
    const value = (node.getAttribute('content') ?? node.getAttribute('alt') ?? text(node))
      .replace(/\s+/g, ' ')
      .trim();
    if (!value) continue;
    const entry = {value, features: features(node)};
    candidates.name.push(entry);
    candidates.description.push(entry);
  }
  candidates.name.push({value: page.hostname, features: ['bias', 'tag:hostname']});
  const links = [...doc.querySelectorAll('a[href], link[rel~="next"][href]')];
  const usable = (node: Element) => {
    const url = linkUrl(node, page);
    return (
      !!url && forward(url, page) && !node.closest('[aria-disabled="true"], [disabled], .disabled')
    );
  };
  function checked(selector: string, node: Element): Rule | undefined {
    const matches = sizzleQuerySelectorAll(doc, selector);
    if (
      !matches.length ||
      matches.some(
        (match) =>
          !usable(match) || address(linkUrl(match, page)!) !== address(linkUrl(node, page)!),
      )
    )
      return;
    return {selector, pipeline: [{name: 'getProp', args: ['href']}]};
  }
  for (const node of links) {
    const url = linkUrl(node, page);
    if (!url) continue;
    const baseFeatures = [
      ...features(node),
      url.pathname === page.pathname ? 'same-path' : 'other-path',
    ];
    for (const part of url.pathname.toLowerCase().split(/[^\p{L}]+/u)) {
      if (
        /^(?:login|signin|auth|logout|signout|register|search|browse|tracker|details|download|torrent)$/.test(
          part,
        )
      )
        baseFeatures.push(`path:${part}`);
    }
    for (const [key, value] of url.searchParams)
      if (/^(?:action|mode|page|do)$/.test(key) && /^(?:login|signin|logout|register)$/.test(value))
        baseFeatures.push(`action:${value}`);
    if (node.localName === 'a') candidates.loginUrl.push({value: url.href, features: baseFeatures});
    if (!usable(node)) continue;
    const container = node.closest(pagination),
      prefix = container ? path(container) + ' ' : '';
    const selectors: string[] = [];
    if (node.getAttribute('rel')?.toLowerCase().split(/\s+/).includes('next'))
      selectors.push(`${node.localName}[rel~="next"][href]`);
    for (const attribute of ['aria-label', 'title']) {
      const label = node.getAttribute(attribute);
      if (label && nextLabel.test(label))
        selectors.push(`${prefix}a[${attribute}=${JSON.stringify(label)}]`);
    }
    for (const name of node.classList)
      if (markerClass.test(name)) selectors.push(`${prefix}a.${CSS.escape(name)}`);
    for (const name of node.parentElement?.classList ?? [])
      if (markerClass.test(name)) selectors.push(`${prefix}.${CSS.escape(name)} > a`);
    if (nextLabel.test(text(node)))
      selectors.push(
        `${prefix}a${text(node)
          .split(/\s+/)
          .map((word) => `:contains(${JSON.stringify(word)})`)
          .join('')}`,
      );
    for (const scope of [
      ...new Set(
        [container, node.parentElement, node.parentElement?.parentElement].filter(
          (value): value is Element => value != null,
        ),
      ),
    ])
      for (const current of scope.querySelectorAll(currentSelector)) {
        if (!/^\d+$/.test(text(current))) continue;
        const next = current.nextElementSibling;
        const target = next?.matches('a[href]') ? next : next?.querySelector('a[href]');
        if (target !== node || text(node) !== String(Number(text(current)) + 1)) continue;
        baseFeatures.push('numeric:next');
        const marker = current.hasAttribute('aria-current')
          ? '[aria-current="page"]'
          : ['current', 'active', 'selected'].find((name) => current.classList.contains(name));
        const selector = marker?.startsWith('[')
          ? marker
          : marker
            ? '.' + marker
            : current.localName;
        selectors.push(
          `${path(current.parentElement!)} ${selector} + ${next!.localName}${target === next ? '[href]' : ' a[href]:first-of-type'}`,
        );
      }
    const rule = selectors.map((selector) => checked(selector, node)).find(Boolean);
    const observedNext =
      !rule && !!node.parentElement && nextPageAfterCurrent(node.parentElement) === url.href;
    if (observedNext) baseFeatures.push('numeric:next');
    candidates.nextPageUrl.push({
      value: url.href,
      features: [
        ...baseFeatures,
        rule ? 'rule:stable' : observedNext ? 'rule:observed' : 'rule:unstable',
      ],
      rule,
      stable: !!rule,
      observedNext,
    });
  }
  return candidates;
}

export function inferPageDetails(candidates: PageCandidates, page: URL, rank: Rank) {
  const selected = Object.fromEntries(
    pageFields.map((field) => {
      const best = rank(field, candidates[field])[0];
      return [field, best && best.score > 0 ? best : undefined];
    }),
  );
  const login = selected.loginUrl;
  const auth =
    login && !/logout|signout|sign-out/i.test(login.value) ? {url: login.value} : undefined;
  return {
    description: {
      name: selected.name?.value ?? page.hostname,
      url: page.origin,
      description: selected.description?.value ?? '',
    },
    auth,
    nextPage: selected.nextPageUrl?.stable ? selected.nextPageUrl.rule : undefined,
    observedNextPageUrl: selected.nextPageUrl?.observedNext
      ? selected.nextPageUrl.value
      : undefined,
  };
}

export function pageElementPath(node: Element): string {
  for (const selector of [
    node.id ? '#' + CSS.escape(node.id) : '',
    node.localName + [...node.classList].map((name) => '.' + CSS.escape(name)).join(''),
  ])
    if (selector && node.ownerDocument.querySelectorAll(selector).length === 1) return selector;
  if (!node.parentElement) return node.localName;
  const siblings = [...node.parentElement.children].filter(
    (other) => other.localName === node.localName,
  );
  return `${pageElementPath(node.parentElement)} > ${node.localName}:nth-of-type(${siblings.indexOf(node) + 1})`;
}
