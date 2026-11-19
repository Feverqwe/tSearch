import {monthReplace} from '../../../src/tools/exKitLegacyFn.ts';

import {type SearchEvidence, inferSearch} from './search-template.ts';
import {type ValueFormat, inferDateFormat, inferSizeFormat} from './value-formats.ts';

// This module runs in a browser without a framework or external model runtime.
export const fields = [
  'title',
  'size',
  'seeds',
  'peers',
  'date',
  'categoryTitle',
  'downloadUrl',
] as const;

type Field = (typeof fields)[number];
type ColumnField = Exclude<Field, 'title'>;
interface Rule {
  selector: string;
  pipeline: {name: string; args?: string[]}[];
}
interface Candidate {
  column: number;
  rule: Rule;
  features: string[];
  sectionUrl?: Rule;
  format?: Omit<ValueFormat, 'pipeline'>;
}
interface ParserModel {
  fields: Partial<Record<Field, Record<string, number>>>;
}
interface ResultGroup {
  row: {selector: string};
  skipFromStart: number;
  skipFromEnd: number;
  count: number;
  candidates: Record<Field, Candidate[]>;
  detail?: Rule;
  section?: {title: Rule; url?: Rule};
  fieldColumns?: Partial<Record<Field, number[]>>;
}

function candidateLists(): Record<Field, Candidate[]> {
  return {title: [], size: [], seeds: [], peers: [], date: [], categoryTitle: [], downloadUrl: []};
}

const hints = {
  title: /(?:^|[\W_])(?:topic|title|name|название|раздача|тема)(?:$|[\W_])|t-title|^nam$/,
  size: /size|размер|bytes|байт/,
  seeds: /seed|сид|раздают|раздающ|^se?$|^sl_s$/,
  peers: /leech|peer|пир|лич|качают|качающ|^le?$|^sl_p$/,
  date: /date|added|time|добав|дата/,
  categoryTitle: /categor|forum|категор|раздел|f-name/,
  downloadUrl: /download|скач|^dl$/,
};

const datePattern = /\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|сегодня|вчера|today|yesterday/i;
const namedMonthDate = /^\d{1,2}\s+\d{1,2}\.?\s+\d{2,4}(?:\s|$)/;
const monthFirstDate = /^([a-z]{3})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+['’]?(\d{2,4})$/i;
// The capture patterns are exported to ExKit replaceRe rules, which use ig flags.
const sizePattern = /(\d[\d., ]*\s*(?:[kmgt]i?b|[кмгт]и?б|bytes?|байт(?:а|ов)?|b))(?![a-zа-яё])/i;
const topicLink = /(?:details|viewtopic|\btopic|\/(?:view|ep)\/\d|\/torrents?\/\d)/i;
const downloadLink =
  /^magnet:\?|(?:^|\/)(?:download(?:\.php)?|dl\.php)(?:[/?#]|$)|\.torrent(?:[?#]|$)/i;
const integer = /^\d+$/;
const epoch = /^1[0-9]{9}$/;
const sectionMarkers =
  '.category, .forum, .f-name-col, a[href*="viewforum.php"], a[href*="forumdisplay.php"], a[href*="tracker.php?f="], a[href*="/category/"]';
const text = (node: Node | null | undefined) =>
  (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const method = (name: string, ...args: string[]) => (args.length ? {name, args} : {name});
const readText = [method('getText'), method('trim')];
const readLink = [method('getProp', 'href')];
const captureText = (pattern: RegExp, replacement = '$1') => [
  ...readText,
  method('replaceRe', `^[\\s\\S]*?${pattern.source}[\\s\\S]*$`, replacement),
];

function elementPath(element: Element): string {
  const {ownerDocument, localName, id, classList, parentElement} = element;
  const names = [...classList].map((name) => `.${CSS.escape(name)}`);
  for (const selector of [id && `#${CSS.escape(id)}`, `${localName}${names.join('')}`]) {
    if (selector && ownerDocument.querySelectorAll(selector).length === 1) return selector;
  }
  if (!parentElement) return localName;
  const siblings = [...parentElement.children].filter((child) => child.localName === localName);
  return `${elementPath(parentElement)} > ${localName}:nth-of-type(${siblings.indexOf(element) + 1})`;
}

function httpLink(node: Element | null) {
  if (!node) return false;
  const href = node.getAttribute('href')?.trim();
  if (!href || href.startsWith('#')) return false;
  try {
    const url = new URL(href, node.ownerDocument.baseURI);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function tables(doc: Document) {
  return [...doc.querySelectorAll<HTMLTableElement>('table')].flatMap((table) => {
    const all = [...table.querySelectorAll<HTMLTableRowElement>(':scope > tbody > tr')];
    const groups = new Map<number, HTMLTableRowElement[]>();
    for (const row of all) {
      if (
        row.cells.length < 3 ||
        [...row.cells].some((cell) => cell.tagName !== 'TD' || cell.rowSpan !== 1)
      )
        continue;
      if (![...row.querySelectorAll('a[href]')].some((a) => httpLink(a) && text(a).length > 3))
        continue;
      const width = [...row.cells].reduce((sum, cell) => sum + cell.colSpan, 0);
      const rows = groups.get(width) ?? [];
      rows.push(row);
      groups.set(width, rows);
    }
    let [rows] = [...groups.values()].sort((a, b) => b.length - a.length);
    if (!rows?.length) return [];
    const bodyPath = `${elementPath(table)} > tbody`;
    const heading =
      table.tHead?.rows[0] ??
      all.slice(0, all.indexOf(rows[0])).findLast((row) => row.cells.length > 1);
    const downloadSlot = optionalDownloadSlot(groups, heading);
    let optionalSlot: number | undefined;
    if (downloadSlot !== undefined) {
      const candidates = new Set([...groups.values()].flat());
      const merged = all.filter((row) => candidates.has(row));
      if (all.indexOf(merged.at(-1)!) - all.indexOf(merged[0]) + 1 === merged.length) {
        rows = merged;
        optionalSlot = downloadSlot;
      }
    }
    const first = all.indexOf(rows[0]);
    const last = all.indexOf(rows[rows.length - 1]);
    if (last - first + 1 === rows.length) {
      const row = {selector: `${bodyPath} > tr`};
      return [
        {
          rows,
          row,
          skipFromStart: first,
          skipFromEnd: all.length - last - 1,
          heading,
          optionalSlot,
        },
      ];
    }
    for (const name of rows[0].classList) {
      const selector = `tr.${CSS.escape(name)}`;
      const matched = all.filter((row) => row.matches(selector));
      if (matched.length === rows.length && matched.every((row, index) => row === rows[index])) {
        return [
          {
            rows,
            row: {selector: `${bodyPath} > ${selector}`},
            skipFromStart: 0,
            skipFromEnd: 0,
            heading,
            optionalSlot: undefined,
          },
        ];
      }
    }
    return [];
  });
}

function optionalDownloadSlot(
  groups: Map<number, HTMLTableRowElement[]>,
  heading?: HTMLTableRowElement,
) {
  if (!heading || groups.size !== 2) return;
  const width = heading.cells.length;
  const wide = groups.get(width);
  const narrow = groups.get(width - 1);
  if (!wide || !narrow) return;
  const download = [...heading.cells].filter((cell) =>
    headingFields(cell)?.includes('downloadUrl'),
  );
  if (download.length !== 1) return;
  const slot = download[0].cellIndex;
  if (slot === 0 || slot === width - 1) return;
  const hasTopic = (row: HTMLTableRowElement) =>
    [...row.querySelectorAll('a[href]')].some(
      (link) => httpLink(link) && !!text(link) && topicLink.test(link.getAttribute('href') ?? ''),
    );
  if (
    ![...wide, ...narrow].every(
      (row) => [...row.cells].every((cell) => cell.colSpan === 1) && hasTopic(row),
    ) ||
    !wide.every((row) => {
      const cell = row.cells[slot];
      const links = [...cell.querySelectorAll('a[href]')];
      return links.length
        ? links.every((link) => downloadLink.test(link.getAttribute('href') ?? ''))
        : !text(cell);
    })
  )
    return;
  return slot;
}

function features(
  cells: Element[],
  heading: Element | undefined,
  index: number,
  width: number,
  selectedLink?: string,
  nestedCounter?: 'seeds' | 'peers',
) {
  const href = selectedLink
    ? (cells[0].querySelector(selectedLink)?.getAttribute('href') ?? '')
    : '';
  const labels = [
    text(heading),
    heading?.getAttribute('title') ?? '',
    ...(heading?.classList ?? []),
    ...[...(heading?.querySelectorAll('a[href]') ?? [])].flatMap((node) =>
      (node.getAttribute('href') ?? '')
        .split(/[?&]/)
        .filter((part) => /^(?:sort_field|sort|s|orderby)=/.test(part)),
    ),
    ...cells[0].classList,
    ...[...cells[0].querySelectorAll('[class]')].slice(0, 4).flatMap((node) => [...node.classList]),
  ].map((value) => value.toLowerCase());
  return [
    ...new Set(
      [
        'bias',
        `column:${Math.min(index, 8)}`,
        `end:${Math.min(width - index - 1, 5)}`,
        ...Object.entries(hints)
          .filter(([field, hint]) =>
            nestedCounter && (field === 'seeds' || field === 'peers')
              ? field === nestedCounter
              : labels.some((label) => hint.test(label)),
          )
          .map(([key]) => `hint:${key}`),
        ...labels
          .flatMap((label) => label.match(/[\p{L}]+/gu) ?? [])
          .map((word) => `label:${word}`),
        topicLink.test(href) ? 'topic-link' : '',
        ...(downloadLink.test(href) ? ['download-link', 'hint:downloadUrl'] : []),
        /(?:browse|tracker|forumdisplay)/i.test(href) ? 'listing-link' : '',
        `length:${Math.min(3, Math.floor(cells.reduce((sum, cell) => sum + text(cell).length, 0) / cells.length / 14))}`,
      ].filter(Boolean),
    ),
  ];
}

function headingFields(heading: Element | undefined): Field[] | undefined {
  if (!heading) return undefined;
  const visible = [text(heading), heading.getAttribute('title') ?? ''].filter(Boolean);
  const fieldsFor = (labels: string[]) =>
    fields.filter((field) => labels.some((label) => hints[field].test(label.toLowerCase())));
  const explicit = fieldsFor(visible);
  if (explicit.length) return explicit;
  const structural = fieldsFor([
    ...heading.classList,
    ...[...heading.querySelectorAll('a[href]')].flatMap((node) =>
      (node.getAttribute('href') ?? '')
        .split(/[?&]/)
        .filter((part) => /^(?:sort_field|sort|s|orderby)=/.test(part)),
    ),
  ]);
  return structural.length ? structural : visible.length ? [] : undefined;
}

function columnRules(cells: HTMLTableCellElement[], path: string, heading?: Element) {
  const options: Partial<
    Record<
      Field,
      Rule & {
        selectedLink?: string;
        nestedCounter?: 'seeds' | 'peers';
      }
    >
  > = {};
  const add = (
    field: Field,
    suffix: string,
    pipeline: Rule['pipeline'],
    predicate: (cell: HTMLTableCellElement) => boolean,
    metadata?: {selectedLink?: string; nestedCounter?: 'seeds' | 'peers'},
  ) => {
    const count = cells.filter(predicate).length;
    if (count < cells.length * 0.8) return false;
    options[field] = {selector: path + suffix, pipeline, ...metadata};
    return true;
  };
  const anchorSelectors = new Set(['a[href^="magnet:"]', 'a[href]:nth-last-of-type(1)', 'a[href]']);
  for (const anchor of cells[0].querySelectorAll('a[href]')) {
    const siblings = [...(anchor.parentElement?.children ?? [])].filter(
      (node) => node.tagName === 'A',
    );
    anchorSelectors.add(`a[href]:nth-of-type(${siblings.indexOf(anchor) + 1})`);
  }
  const addLink = (
    field: 'title' | 'categoryTitle' | 'downloadUrl',
    pipeline: Rule['pipeline'],
    accept: (link: Element) => boolean,
  ) =>
    [...anchorSelectors].some((selector) =>
      add(
        field,
        ' ' + selector,
        pipeline,
        (cell) => {
          const link = cell.querySelector(selector);
          return (
            link !== null &&
            (httpLink(link) ||
              (field === 'downloadUrl' && !!link.getAttribute('href')?.startsWith('magnet:?'))) &&
            accept(link)
          );
        },
        {selectedLink: selector},
      ),
    );
  const isLinkedText = (link: Element) =>
    text(link).length > 0 && !downloadLink.test(link.getAttribute('href') ?? '');
  addLink(
    'title',
    readText,
    (link) => isLinkedText(link) && topicLink.test(link.getAttribute('href') ?? ''),
  ) || addLink('title', readText, isLinkedText);
  addLink('categoryTitle', readText, isLinkedText);
  if (!options.categoryTitle)
    add(
      'categoryTitle',
      ' img[alt]',
      [method('getAttr', 'alt')],
      (cell) => !!cell.querySelector<HTMLImageElement>('img[alt]')?.alt,
    );
  if (!options.categoryTitle) {
    addLink('categoryTitle', [method('getAttr', 'title')], (link) => !!link.getAttribute('title'));
  }
  if (!options.categoryTitle && hints.categoryTitle.test(text(heading).toLowerCase())) {
    add(
      'categoryTitle',
      '',
      readText,
      (cell) => text(cell).length > 0 && text(cell).length < 100 && !integer.test(text(cell)),
    );
  }
  addLink('downloadUrl', readLink, (link) => downloadLink.test(link.getAttribute('href') ?? ''));
  const hasCounterPair = (cell: HTMLTableCellElement) =>
    integer.test(text(cell.querySelector('span.green'))) &&
    integer.test(text(cell.querySelector('span.red')));
  const counters = [/^(\d+)\s*\|\s*\d+$/, /^\d+\s*\|\s*(\d+)$/];
  const isoDate = /((?:19|20)\d{2}-\d{2}-\d{2})(?:\s*(\d{1,2}:\d{2}(?::\d{2})?))?/;
  for (const field of ['size', 'seeds', 'peers', 'date'] as const) {
    const timestamp = field === 'date';
    const numeric = timestamp ? epoch : integer;
    add(field, '', [method('getAttr', 'data-ts_text'), method('toInt')], (cell) =>
      numeric.test(cell.getAttribute('data-ts_text') ?? ''),
    );
    if (!options[field])
      add(field, ' u', [...readText, method('toInt')], (cell) =>
        numeric.test(text(cell.querySelector('u'))),
      );
    if (timestamp && !options.date) {
      add('date', '', [method('getAttr', 'data-timestamp'), method('toInt')], (cell) =>
        /^\d{10}(?:\d{3})?$/.test(cell.getAttribute('data-timestamp') ?? ''),
      );
    }
    if (timestamp && !options.date) {
      add('date', '', [...readText, method('toInt')], (cell) =>
        /^\d{10}(?:\d{3})?$/.test(text(cell)),
      );
    }
    if (field === 'size' && !options[field]) {
      add(field, '', [...captureText(sizePattern), method('legacySizeFormat')], (cell) =>
        sizePattern.test(text(cell)),
      );
    }
    if (field === 'size' && !options.size && hints.size.test(text(heading).toLowerCase())) {
      add('size', '', [...readText, method('toInt')], (cell) => /^\d+$/.test(text(cell)));
    }
    if (timestamp && !options.date) {
      add('date', '', [...captureText(isoDate, '$1 $2'), method('legacyParseDate', '0')], (cell) =>
        isoDate.test(text(cell)),
      );
    }
    if (timestamp && !options.date) {
      const timeFirst = /^(\d{1,2}:\d{2})\s+(\d{1,2}-\d{1,2}-\d{2,4})$/;
      for (const suffix of [' p:nth-of-type(1)', '']) {
        if (
          add(
            'date',
            suffix,
            [
              ...readText,
              method('replaceRe', timeFirst.source, '$2 $1'),
              method('legacyParseDate', '1'),
            ],
            (cell) => timeFirst.test(text(suffix ? cell.querySelector(suffix.trim()) : cell)),
          )
        )
          break;
      }
    }
    if (timestamp && !options.date) {
      add(
        'date',
        ' p:nth-last-of-type(1)',
        [
          ...readText,
          method('legacyReplaceToday'),
          method('legacyReplaceMonth'),
          method('legacyParseDate', '1'),
        ],
        (cell) => {
          const normalized = monthReplace(text(cell.querySelector('p:nth-last-of-type(1)')));
          return datePattern.test(normalized) || namedMonthDate.test(normalized);
        },
      );
    }
    if (timestamp && !options.date) {
      add(
        'date',
        '',
        [
          ...readText,
          method('legacyReplaceToday'),
          method('legacyReplaceMonth'),
          method('legacyParseDate', '1'),
        ],
        (cell) => datePattern.test(text(cell)) || namedMonthDate.test(monthReplace(text(cell))),
      );
    }
    if (timestamp && !options.date) {
      add(
        'date',
        '',
        [
          ...readText,
          method('replaceRe', monthFirstDate.source, '$2 $1 $3'),
          method('legacyReplaceMonth'),
          method('legacyParseDate', '1'),
        ],
        (cell) => {
          const normalized = text(cell).replace(monthFirstDate, '$2 $1 $3');
          return normalized !== text(cell) && namedMonthDate.test(monthReplace(normalized));
        },
      );
    }
    if ((field === 'seeds' || field === 'peers') && !options[field]) {
      const isCount = (cell: HTMLTableCellElement) =>
        /^(?:\d[\d,]*\+?|\d[\d,]*\s*\+\s*\d[\d,]*\s*(?:ext|external))$/i.test(text(cell));
      const labelledWithValues = headingFields(heading)?.includes(field) && cells.some(isCount);
      add(
        field,
        '',
        [...readText, method('replaceRe', '[,\\s]', ''), method('toInt')],
        (cell) => isCount(cell) || (!!labelledWithValues && /^[-–—]$/.test(text(cell))),
      );
    }
    if ((field === 'seeds' || field === 'peers') && !options[field]) {
      const selector = field === 'seeds' ? 'span.green' : 'span.red';
      add(field, ' ' + selector, [...readText, method('toInt')], hasCounterPair, {
        nestedCounter: field,
      });
    }
    if ((field === 'seeds' || field === 'peers') && !options[field]) {
      const pattern = counters[field === 'seeds' ? 0 : 1];
      add(
        field,
        '',
        [...readText, method('replaceRe', pattern.source, '$1'), method('toInt')],
        (cell) => pattern.test(text(cell)),
        {nestedCounter: field},
      );
    }
  }
  return options;
}

function alignedColumns(rows: HTMLTableRowElement[], optionalSlot?: number) {
  const width = rows.reduce((max, row) => Math.max(max, row.cells.length), 0);
  const starts = rows.map((row) => {
    const columns: HTMLTableCellElement[] = [];
    let slot = 0;
    for (const cell of row.cells) {
      if (slot === optionalSlot && row.cells.length < width) slot++;
      columns[slot] = cell;
      slot += cell.colSpan;
    }
    return columns;
  });
  return starts[0].flatMap((first, slot) => {
    const cells = starts.map((columns) => columns[slot]);
    if (!cells.every(Boolean)) return [];
    const column = first.cellIndex;
    if (cells.every((cell) => cell.cellIndex === column)) {
      return [{column, slot, cells, selector: `:scope > td:nth-of-type(${column + 1})`}];
    }
    const offset = rows[0].cells.length - column;
    if (cells.every((cell, index) => rows[index].cells.length - cell.cellIndex === offset)) {
      return [{column, slot, cells, selector: `:scope > td:nth-last-of-type(${offset})`}];
    }
    return [];
  });
}

function relativePath(root: Element, target: Element): string {
  const parts: string[] = [];
  for (let node: Element = target; node !== root; node = node.parentElement!) {
    const siblings = [...node.parentElement!.children].filter(
      (child) => child.localName === node.localName,
    );
    parts.unshift(`${node.localName}:nth-of-type(${siblings.indexOf(node) + 1})`);
  }
  return parts.length ? ':scope > ' + parts.join(' > ') : ':scope';
}

function sectionLink(rows: Element[], selector: string): Rule | undefined {
  if (
    rows.length &&
    rows.every((row) => {
      const node = row.querySelector(selector);
      return node?.matches('a[href]') && httpLink(node);
    })
  ) {
    return {selector, pipeline: readLink};
  }
  const first = rows[0]?.querySelector(selector)?.closest('a[href]');
  if (!first || !rows[0].contains(first)) return;
  const parentSelector = relativePath(rows[0], first);
  if (rows.every((row) => httpLink(row.querySelector(parentSelector)))) {
    return {selector: parentSelector, pipeline: readLink};
  }
}

function findSection(group: ResultGroup, doc: Document) {
  const rows = [...doc.querySelectorAll(group.row.selector)]
    .slice(group.skipFromStart, group.skipFromEnd ? -group.skipFromEnd : undefined)
    .slice(0, 8);
  const [first] = rows;
  if (!first) return;
  for (const candidate of group.candidates.categoryTitle) {
    candidate.sectionUrl = sectionLink(rows, candidate.rule.selector);
  }
  const nodes = new Set<Element>();
  for (const marker of first.querySelectorAll(sectionMarkers)) {
    const parentLink = marker.closest('a[href]');
    const children = marker.querySelectorAll('a[href]');
    const node =
      parentLink && first.contains(parentLink)
        ? parentLink
        : children.length === 1
          ? children[0]
          : marker;
    if (text(node)) nodes.add(node);
  }
  if (nodes.size !== 1) return;
  const [node] = nodes;
  const selector = relativePath(first, node);
  if (
    !rows.every((row) => {
      const match = row.querySelector(selector);
      const marker = match?.closest(sectionMarkers);
      return (
        !!match &&
        !!text(match) &&
        ((marker && row.contains(marker)) || match.querySelector(sectionMarkers))
      );
    })
  )
    return;
  group.section = {title: {selector, pipeline: readText}, url: sectionLink(rows, selector)};
}

const cardSize = /(?:размер|size)\s*:\s*(\d[\d., ]*\s*(?:[kmgt]i?b|[кмгт]б))/iu;

function cardGroups(doc: Document) {
  const headings = 'h2, h3, h4';
  const headingLinks =
    'h2 a[href], h3 a[href], h4 a[href], a[href] > h2, a[href] > h3, a[href] > h4';
  const parents = new Set(
    [...doc.querySelectorAll(headingLinks)].flatMap((heading) => {
      let parent = heading.parentElement;
      const result: Element[] = [];
      while (parent && parent !== doc.body) {
        if (parent.children.length >= 2 || parent.firstElementChild?.matches('article, div, li'))
          result.push(parent);
        parent = parent.parentElement;
      }
      return result;
    }),
  );
  return [...parents].flatMap((parent) => {
    const templates = new Map<string, Element[]>();
    for (const child of parent.children) {
      if (!['article', 'div', 'li'].includes(child.localName) || !child.querySelector(headingLinks))
        continue;
      const selector =
        child.localName +
        [...child.classList]
          .sort()
          .map((name) => `.${CSS.escape(name)}`)
          .join('');
      const group = templates.get(selector) ?? [];
      group.push(child);
      templates.set(selector, group);
    }
    return [...templates].flatMap(([template, cards]) => {
      const selector = `${elementPath(parent)} > ${template}`;
      if (doc.querySelectorAll(selector).length !== cards.length) return [];
      const sample = cards.slice(0, 24);
      const first = sample[0];
      const candidates = candidateLists();
      function add(
        field: Field,
        node: Element,
        pipeline: Rule['pipeline'],
        accept: (node: Element) => boolean,
      ) {
        const path = relativePath(first, node);
        const matches = sample.filter((card) => {
          const matched = node === first ? card : card.querySelector(path);
          return matched !== null && accept(matched);
        });
        if (matches.length < sample.length * 0.8) return;
        candidates[field].push({
          column: fields.indexOf(field),
          rule: {selector: path, pipeline},
          features: ['bias', `hint:${field}`, ...(field === 'title' ? ['topic-link'] : [])],
        });
      }
      for (const title of first.querySelectorAll(headingLinks)) {
        const anchor = title.closest('a[href]');
        if (anchor)
          add(
            'title',
            anchor,
            readText,
            (node) =>
              httpLink(node) &&
              !!text(node) &&
              (node.closest(headings) !== null || node.querySelector(headings) !== null),
          );
      }
      add(
        'size',
        first,
        [
          ...readText,
          method('replaceRe', `^[\\s\\S]*?${cardSize.source}[\\s\\S]*$`, '$1'),
          method('legacySizeFormat'),
        ],
        (card) => cardSize.test(text(card)),
      );
      for (const [field, marker] of [
        ['seeds', 'green'],
        ['peers', 'red'],
      ] as const) {
        const counter = first.querySelector(
          `.peersinfo [color="${marker}"], .peersinfo .${marker}`,
        );
        if (counter)
          add(field, counter, [...readText, method('toInt')], (node) => integer.test(text(node)));
      }
      if (
        !candidates.title.length ||
        !(cards.length === 1
          ? [candidates.size, candidates.seeds, candidates.peers].every((entries) => entries.length)
          : [candidates.size, candidates.seeds, candidates.peers].some((entries) => entries.length))
      )
        return [];
      return [{row: {selector}, skipFromStart: 0, skipFromEnd: 0, count: cards.length, candidates}];
    });
  });
}

function pairedRows(doc: Document): ResultGroup[] {
  const leading = 'tr:has(> td[rowspan="2"])';
  const torrent = 'a[type="application/x-bittorrent"][href]';
  const details = 'a[href*="details.php"]';
  const utcDate = /(?:date|дата)\s*:\s*(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) UTC/i;
  const seedCount = /\bS:\s*(\d+)/i;
  const peerCount = /\bL:\s*(\d+)/i;
  return [...doc.querySelectorAll('table > tbody')].flatMap((body) => {
    const rows = [...body.querySelectorAll(':scope > ' + leading)];
    if (
      !rows.length ||
      !rows.every(
        (row) =>
          row.nextElementSibling?.tagName === 'TR' &&
          !row.nextElementSibling.matches(leading) &&
          httpLink(row.querySelector(torrent)) &&
          !!text(row.querySelector(torrent)) &&
          httpLink(row.querySelector(details)),
      )
    )
      return [];

    const candidates = candidateLists();
    const add = (field: Field, selector: string, pipeline: Rule['pipeline']) => {
      candidates[field].push({
        column: fields.indexOf(field),
        rule: {selector, pipeline},
        features: ['bias', `hint:${field}`, field === 'title' ? 'topic-link' : ''],
      });
    };
    add('title', torrent, readText);
    add('downloadUrl', torrent, readLink);
    const following = rows.slice(0, 24).map((row) => row.nextElementSibling!);
    const addFromNextRow = (field: Field, pattern: RegExp, pipeline: Rule['pipeline']) => {
      const cell = [...following[0].children].find((node) => pattern.test(text(node)));
      if (!cell) return;
      const path = relativePath(following[0], cell);
      if (
        following.filter((row) => pattern.test(text(row.querySelector(path)))).length <
        following.length * 0.8
      )
        return;
      add(field, path.replace(':scope', '+ tr'), pipeline);
    };
    addFromNextRow('size', cardSize, [...captureText(cardSize), method('legacySizeFormat')]);
    addFromNextRow('date', utcDate, [...captureText(utcDate, '$1T$2:00Z'), method('parseIsoDate')]);
    addFromNextRow('seeds', seedCount, [...captureText(seedCount), method('toInt')]);
    addFromNextRow('peers', peerCount, [...captureText(peerCount), method('toInt')]);
    return [
      {
        row: {selector: `${elementPath(body)} > ${leading}`},
        skipFromStart: 0,
        skipFromEnd: 0,
        count: rows.length,
        candidates,
        detail: {
          selector: rows.every((row) => row.querySelector('a[href^="magnet:"]'))
            ? 'a[href^="magnet:"]'
            : details,
          pipeline: readLink,
        },
      },
    ];
  });
}

function labeledBlocks(doc: Document): ResultGroup[] {
  const topic = 'p > a[href^="/torrent/"]';
  const parents = new Set(
    [...doc.querySelectorAll(topic)].map(
      (link) => link.parentElement?.parentElement?.parentElement,
    ),
  );
  return [...parents].flatMap((parent) => {
    if (!parent) return [];
    const rowPattern = `div:has(> ${topic})`;
    const rows = [...parent.querySelectorAll(':scope > ' + rowPattern)];
    const header = [...parent.children]
      .slice(0, [...parent.children].indexOf(rows[0]))
      .find((row) => {
        const labels = [...row.children].map((node) => text(node).toLowerCase());
        return [hints.size, hints.seeds, hints.peers].every((hint) =>
          labels.some((label) => hint.test(label)),
        );
      });
    if (!rows.length || !header) return [];

    const sample = rows.slice(0, 24);
    const first = sample[0];
    const width = first.children.length;
    const candidates = candidateLists();
    const fieldColumns: Partial<Record<Field, number[]>> = {seeds: [], peers: []};
    for (const [column, cell] of [...header.children].entries()) {
      for (const field of headingFields(cell) ?? []) (fieldColumns[field] ??= []).push(column);
    }
    const add = (
      field: Field,
      cell: Element,
      suffix: string,
      pipeline: Rule['pipeline'],
      accept: (node: Element) => boolean,
      selectedLink?: string,
    ) => {
      const path = relativePath(first, cell);
      const nodes = sample.flatMap((row) => {
        const node = row.querySelector(path);
        return node && accept(node) ? [node] : [];
      });
      if (nodes.length < sample.length * 0.8) return;
      const column = [...first.children].indexOf(cell);
      candidates[field].push({
        column,
        rule: {selector: path + suffix, pipeline},
        features: features(nodes, header.children[column], column, width, selectedLink),
      });
    };
    const titleCell = first.querySelector(':scope > p');
    if (!titleCell) return [];
    const link = 'a[href^="/torrent/"]';
    add(
      'title',
      titleCell,
      ' > ' + link,
      readText,
      (cell) => httpLink(cell.querySelector(link)) && !!text(cell.querySelector(link)),
      link,
    );
    for (const cell of first.children) {
      add('size', cell, '', [...captureText(sizePattern), method('legacySizeFormat')], (node) =>
        sizePattern.test(text(node)),
      );
      for (const field of ['seeds', 'peers'] as const) {
        add(field, cell, '', [...readText, method('toInt')], (node) => integer.test(text(node)));
      }
    }
    if (!candidates.title.length || !candidates.size.length) return [];
    return [
      {
        row: {selector: `${elementPath(parent)} > ${rowPattern}`},
        skipFromStart: 0,
        skipFromEnd: 0,
        count: rows.length,
        candidates,
        fieldColumns,
      },
    ];
  });
}

const emptyResultsPattern =
  /no (?:results|matches|torrents)(?: found)?\b|\b0 (?:search )?results\b|ничего не найдено|(?:^|\s)не найдено(?:\s|$)|нет (?:результатов|раздач)|(?:раздач|торренты) не найден[оы]|результатов поиска\s*:?\s*0(?!\d)|поиск не прин[её]с результатов|нічого не знайдено/i;

export function hasEmptyResultsNotice(doc: Document) {
  return [...doc.querySelectorAll('td, .alert, .error, .message')].some((node) => {
    const content = text(node);
    return content.length < 250 && emptyResultsPattern.test(content);
  });
}

export function inspectPage(
  html: string,
  pageUrl: string,
  status = 200,
  evidence: SearchEvidence = {},
) {
  const url = new URL(pageUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
    throw new Error('An HTTP(S) page URL is required');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const base = doc.createElement('base');
  base.href = url.href;
  doc.head.prepend(base);

  const groups: ResultGroup[] = tables(doc)
    .map(({rows, heading, optionalSlot, ...structure}) => {
      const sample = rows;
      const width = optionalSlot === undefined ? rows[0].cells.length : heading!.cells.length;
      const candidates = candidateLists();
      const fieldColumns: Partial<Record<Field, number[]>> = {};
      const unlabelledCounters: number[] = [];
      const headings = heading
        ? [...heading.cells].flatMap((cell) => Array(cell.colSpan).fill(cell))
        : [];
      for (const {column, slot, cells, selector} of alignedColumns(sample, optionalSlot)) {
        const signals = features(cells, headings[slot], column, width);
        const declared = headingFields(headings[slot]);
        if (declared === undefined && !signals.some((signal) => signal.startsWith('hint:')))
          unlabelledCounters.push(column);
        for (const field of ['size', 'date', 'seeds', 'peers'] as const) {
          const pairedCounters =
            (field === 'seeds' || field === 'peers') &&
            cells.every(
              (cell) => cell.querySelector('span.green') && cell.querySelector('span.red'),
            );
          if (
            (declared ? declared.includes(field) : signals.includes(`hint:${field}`)) ||
            pairedCounters
          ) {
            (fieldColumns[field] ??= []).push(column);
          }
        }
        const rules = columnRules(cells, selector, headings[slot]);
        for (const field of fields) {
          const candidate = rules[field];
          if (!candidate) continue;
          const {selectedLink, nestedCounter, ...rule} = candidate;
          candidates[field].push({
            column,
            rule,
            features: features(cells, headings[slot], column, width, selectedLink, nestedCounter),
          });
        }
      }
      if (optionalSlot !== undefined) {
        const cells = rows
          .filter((row) => row.cells.length === width)
          .map((row) => row.cells[optionalSlot])
          .filter((cell) => cell.querySelector('a[href]'));
        if (cells.length) {
          const link = 'a[href]';
          // Check both positions so a shifted cell in a shorter row cannot match.
          const selector = `:scope > td:nth-of-type(${optionalSlot + 1}):nth-last-of-type(${width - optionalSlot}) ${link}`;
          candidates.downloadUrl.push({
            column: optionalSlot,
            rule: {selector, pipeline: readLink},
            features: features(cells, headings[optionalSlot], optionalSlot, width, link),
          });
        }
      }
      for (const field of ['seeds', 'peers'] as const) fieldColumns[field] ??= unlabelledCounters;
      return {...structure, count: rows.length, candidates, fieldColumns};
    })
    .filter(
      (group) => group.candidates.title.length && (group.count > 1 || group.candidates.size.length),
    );
  groups.push(...cardGroups(doc), ...pairedRows(doc), ...labeledBlocks(doc));
  const primary = groups.filter(
    (group) =>
      !doc
        .querySelector(group.row.selector)
        ?.closest('aside, nav, footer, header, [role="complementary"], [role="navigation"]'),
  );
  if (primary.length) groups.splice(0, groups.length, ...primary);
  for (const group of groups) {
    const rows = [...doc.querySelectorAll(group.row.selector)].slice(
      group.skipFromStart,
      group.skipFromEnd ? -group.skipFromEnd : undefined,
    );
    for (const field of ['size', 'date'] as const) {
      for (const candidate of group.candidates[field]) {
        const getter = candidate.rule.pipeline.find(
          (step) => step.name === 'getText' || step.name === 'getAttr',
        );
        if (!getter) continue;
        const values = rows.flatMap((row) => {
          let node: Element | null;
          if (candidate.rule.selector.startsWith('+ tr')) {
            node =
              row.nextElementSibling?.querySelector(
                candidate.rule.selector.replace(/^\+ tr/, ':scope'),
              ) ?? null;
          } else {
            node =
              candidate.rule.selector === ':scope'
                ? row
                : row.querySelector(candidate.rule.selector);
          }
          if (!node) return [];
          return [
            getter.name === 'getAttr'
              ? (node.getAttribute(getter.args?.[0] ?? '') ?? '')
              : text(node),
          ];
        });
        const format =
          field === 'size'
            ? inferSizeFormat(values)
            : inferDateFormat(values, doc.documentElement.lang);
        const {pipeline, ...description} = format;
        candidate.format = description;
        if (format.status === 'detected' && pipeline)
          candidate.rule.pipeline = [getter, method('trim'), ...pipeline];
      }
    }
  }
  for (const group of groups) findSection(group, doc);
  const loginForms = [...doc.forms].filter(
    (form) =>
      form.querySelector('input[type=password]:not([disabled])') &&
      form.querySelector('input:not([type]), input[type=text], input[type=email]'),
  );
  const pathLooksLikeLogin = /\/(?:login|signin|sign-in|auth)(?:\.[a-z]+|\/|$)/i.test(url.pathname);
  const visible = text(doc.body);
  const empty = emptyResultsPattern.test(visible);
  const emptyNotice = empty && hasEmptyResultsNotice(doc);
  const mainLogin = loginForms.find(
    (form) =>
      !form.closest('header, nav') && !/quick|header|navbar/i.test(form.id + ' ' + form.className),
  );
  const login = mainLogin ?? loginForms[0];
  const loginTitle = /^(?:login|log in|sign in|вход|авторизация)(?:\s|$|:)/i.test(doc.title.trim());
  const loginPrompt =
    /(?:log in|sign in).{0,70}(?:to view|to search|to continue)|(?:войдите|авторизуйтесь).{0,70}(?:просмотр|поиск|продолж)|(?:необходимо|нужно|требуется)\s+(?:войти|авторизоваться)/i.test(
      visible,
    );
  const loginRequired =
    status === 401 ||
    (status < 500 &&
      login &&
      (pathLooksLikeLogin ||
        (!groups.length && !empty && mainLogin && (loginTitle || loginPrompt))));
  if (loginRequired) {
    return {
      status: 'login-required' as const,
      login: {
        url: url.href,
        ...(login ? {loginForm: {selector: elementPath(login)}} : {}),
      },
    };
  }
  if (status >= 400) return {status: 'request-failed' as const};
  if (emptyNotice) return {status: 'empty' as const};
  if (!groups.length) return {status: empty ? ('empty' as const) : ('unsupported' as const)};
  return {
    status: 'results' as const,
    groups,
    ...inferSearch(doc, url, evidence),
  };
}

export function scoreCandidates(candidates: Candidate[], weights: Record<string, number> = {}) {
  return candidates
    .map((candidate) => ({
      ...candidate,
      score: candidate.features.reduce(
        (sum, feature) => sum + (Object.hasOwn(weights, feature) ? weights[feature] : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score);
}

export function predictPage(
  html: string,
  pageUrl: string,
  model: ParserModel,
  status = 200,
  evidence: SearchEvidence = {},
) {
  const inspected = inspectPage(html, pageUrl, status, evidence);
  return predictInspectedPage(inspected, pageUrl, (field, candidates) =>
    scoreCandidates(candidates, model.fields[field]),
  );
}

export function predictInspectedPage(
  inspected: ReturnType<typeof inspectPage>,
  pageUrl: string,
  rank: (field: Field, candidates: Candidate[]) => (Candidate & {score: number})[],
) {
  if (inspected.status !== 'results') return inspected;
  const ranked = inspected.groups
    .map(({candidates, ...structure}) => {
      const title = rank('title', candidates.title)[0];
      return {
        candidates,
        structure,
        title,
        score: title.score + Math.log1p(structure.count) * 0.12,
      };
    })
    .sort((a, b) => b.score - a.score);
  const {
    candidates,
    structure: {count, detail, section, fieldColumns, ...structure},
    title,
  } = ranked[0];
  const selectors: typeof structure & {
    title: Rule;
    url: Rule;
    nextPageUrl?: Rule;
    categoryUrl?: Rule;
  } & Partial<Record<ColumnField, Rule>> = {
    ...structure,
    title: title.rule,
    url: detail ?? {selector: title.rule.selector, pipeline: readLink},
  };
  const used = new Map<number, Field>([[title.column, 'title']]);
  const formats: Partial<Record<'size' | 'date', Omit<ValueFormat, 'pipeline'>>> = {};
  for (const field of fields) {
    if (field === 'title') continue;
    const strongest = rank(
      field,
      candidates[field].filter((candidate) => {
        if (fieldColumns?.[field] && !fieldColumns[field]!.includes(candidate.column)) return false;
        if (field === 'downloadUrl') return candidate.rule.selector !== selectors.url.selector;
        const previous = used.get(candidate.column);
        return (
          !previous ||
          (field === 'peers' &&
            previous === 'seeds' &&
            JSON.stringify(candidate.rule) !== JSON.stringify(selectors.seeds))
        );
      }),
    )[0];
    if (!strongest || strongest.score <= 0) continue;
    if ((field === 'size' || field === 'date') && strongest.format) {
      formats[field] = strongest.format;
      if (
        strongest.format.status === 'ambiguous' ||
        strongest.format.kind === 'invalid-date' ||
        strongest.format.kind === 'invalid-size'
      )
        continue;
    }
    selectors[field] = strongest.rule;
    if (field === 'categoryTitle' && strongest.sectionUrl) {
      selectors.categoryUrl = strongest.sectionUrl;
    }
    if (field !== 'downloadUrl') used.set(strongest.column, field);
  }
  if (section) {
    selectors.categoryTitle = section.title;
    if (section.url) selectors.categoryUrl = section.url;
    else delete selectors.categoryUrl;
  }
  const page = new URL(pageUrl);
  return {
    status: 'results' as const,
    rowCount: count,
    searchSource: inspected.searchSource,
    formats,
    definition: {
      version: 3,
      type: 'kit',
      description: {name: page.hostname, url: page.origin},
      search: inspected.search,
      selectors,
    },
  };
}
