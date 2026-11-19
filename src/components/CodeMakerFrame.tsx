import {useCallback, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef} from 'react';

import type {Selection, SelectorLocation} from './selectorTypes';
import exKitRequest, {
  type TrackerRequestOptions,
  type TrackerRequestContext,
  type TrackerResponse,
} from '../tools/exKitRequest';
import exKitGetDoc from '../tools/exKitGetDoc';
import getDoc5 from '../sandbox/getDoc5';
import getNodePath from '../tools/getNodePath';
import {StatusCodeError} from '../tools/errors';
import {sizzleQuerySelector, sizzleQuerySelectorAll} from '../tools/sizzleQuery';
import type {TrackerRequestMode} from '../tools/tabProxy';

export async function requestPreview(
  options: TrackerRequestOptions,
  requestMode: TrackerRequestMode | undefined,
  signal: AbortSignal,
  connectRe: RegExp | null = /.+/,
): Promise<TrackerResponse> {
  const context: TrackerRequestContext = {
    connectRe,
    requests: [],
    profileOptions: {},
    requestMode,
  };
  const abort = () => context.requests.forEach((request) => request.abort());
  signal.throwIfAborted();
  signal.addEventListener('abort', abort, {once: true});
  try {
    return await exKitRequest(context, options);
  } catch (error) {
    if (!(error instanceof StatusCodeError)) throw error;
    const response = error.response;
    const charset = /charset=["']?([^;"' ]+)/i.exec(
      response.headers.get('content-type') ?? '',
    )?.[1];
    const body = new TextDecoder(options.charset || charset || 'utf-8').decode(
      await response.arrayBuffer(),
    );
    signal.throwIfAborted();
    return {
      body,
      url: response.url,
      statusCode: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
    };
  } finally {
    signal.removeEventListener('abort', abort);
  }
}

const selectClass = 'kit_select';

export function useCodeMakerFrame(
  response: TrackerResponse | undefined,
  host: string,
  selection: Selection | null,
  onPath: (path: string, commit: boolean) => void,
  onCancel: () => void,
) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const displayedDoc = useRef<Document>(null);
  const parsed = useMemo(
    () => (response ? exKitGetDoc(response.body, response.url) : null),
    [response],
  );

  useLayoutEffect(() => {
    const doc = iframe.current?.contentDocument;
    displayedDoc.current = null;
    if (!response || !doc) return;
    const safe = getDoc5(response.body, response.url, doc);
    const styles = doc.createElement('style');
    styles.textContent = `
    :root { color: CanvasText; background: Canvas; }
    .${selectClass} {
      color:#000 !important;
      background-color:#FFCC33 !important;
      cursor:pointer;
      box-shadow: 0 0 3px red, inset 0 0 3px red !important;
    }`;
    (safe.head ?? safe.body ?? safe).appendChild(styles);
    while (doc.firstChild) doc.firstChild.remove();
    while (safe.firstChild) doc.appendChild(safe.firstChild);
    displayedDoc.current = doc;
    const root = document.documentElement;
    const applyTheme = () => {
      const palette = getComputedStyle(root);
      const previewRoot = doc.documentElement;
      previewRoot.style.colorScheme = root.dataset.theme ?? 'light';
      previewRoot.style.backgroundColor = palette.getPropertyValue('--canvas');
      previewRoot.style.color = palette.getPropertyValue('--ink');
    };
    applyTheme();
    const observer = new MutationObserver(applyTheme);
    observer.observe(root, {attributes: true, attributeFilter: ['data-theme']});
    return () => {
      observer.disconnect();
      displayedDoc.current = null;
    };
  }, [host, response]);

  const notify = useEffectEvent(onPath);
  const cancel = useEffectEvent(onCancel);
  useEffect(() => {
    const doc = displayedDoc.current;
    if (!selection || !doc) return;
    function handle(event: MouseEvent, commit: boolean) {
      const target = event.target as Element | null;
      if (target?.nodeType !== Node.ELEMENT_NODE || !selection || !doc) return;
      if (!commit) clearHighlight(doc);
      try {
        const location = selection.location;
        const container =
          location.containerSelector && parsed
            ? getResultRows(parsed, location)
                .map((row) => correspondingElement(row, doc))
                .find((row) => row?.contains(target))
            : doc;
        if (!container) return;
        const named =
          selection.id === 'loginForm'
            ? target.closest('form')
            : selection.id === 'categoryTitle'
              ? target.closest('a[data-preview-href]')
              : null;
        const element = named && container.contains(named) ? named : target;
        if (!commit) element.classList.add(selectClass);
        const path =
          element === container
            ? ':scope'
            : getNodePath(element, container, {skipClassNames: [selectClass]});
        notify(path, commit);
        if (commit && path) doc.removeEventListener('click', click);
      } catch {
        notify('', commit);
      }
    }
    const hover = (event: MouseEvent) => handle(event, false);
    const click = (event: MouseEvent) => {
      event.preventDefault();
      handle(event, true);
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        cancel();
      }
    };
    doc.addEventListener('keydown', keyDown);
    doc.addEventListener('mouseover', hover);
    doc.addEventListener('click', click);
    return () => {
      clearHighlight(doc);
      doc.removeEventListener('keydown', keyDown);
      doc.removeEventListener('mouseover', hover);
      doc.removeEventListener('click', click);
    };
  }, [host, parsed, selection]);

  const resolve = useCallback(
    (path: string, location: SelectorLocation) => {
      return sizzleQuerySelector(getContainer(parsed, location), path);
    },
    [parsed],
  );

  const highlight = useCallback(
    (path: string, location: SelectorLocation, scroll: boolean) => {
      if (!parsed || !displayedDoc.current) return;
      const doc = displayedDoc.current;
      clearHighlight(doc);
      if (!path) return 0;
      const containers = location.containerSelector ? getResultRows(parsed, location) : [parsed];
      const nodes = containers.flatMap((container) =>
        path === ':scope' && container.nodeType === 1
          ? [container as Element]
          : sizzleQuerySelectorAll(container, path),
      );
      const matches = new Set(nodes.map((node) => correspondingElement(node, doc)));
      for (const node of matches) node?.classList.add(selectClass);
      if (scroll) matches.values().next().value?.scrollIntoView({block: 'nearest'});
      return nodes.length;
    },
    [host, parsed],
  );

  return {
    iframe,
    parsed,
    resolve,
    highlight,
  };
}

function clearHighlight(doc: Document) {
  doc
    .querySelectorAll(`.${selectClass}`)
    .forEach((element) => element.classList.remove(selectClass));
}

export function getResultRows(doc: Document, location: SelectorLocation): Element[] {
  if (!location.containerSelector) return [];
  const matches = sizzleQuerySelectorAll(doc, location.containerSelector);
  const {skipFromStart, skipFromEnd} = location;
  if (skipFromStart) matches.splice(0, skipFromStart);
  if (skipFromEnd) matches.splice(-skipFromEnd);
  return matches;
}

function getContainer(doc: Document | null, location: SelectorLocation): ParentNode {
  if (doc) {
    if (!location.containerSelector) return doc;
    const [row] = getResultRows(doc, location);
    if (row) return row;
  }
  throw new Error('Container is not found');
}

// Match the inert parse's element positions to the corresponding sanitized copy.
function correspondingElement(element: Element, doc: Document): Element | undefined {
  const positions: number[] = [];
  let node = element;
  while (node.parentElement) {
    const parent = node.parentElement;
    positions.push(Array.prototype.indexOf.call(parent.children, node));
    node = parent;
  }
  let copy: Element | undefined = doc.documentElement;
  for (let index = positions.length - 1; index >= 0; index--) {
    copy = copy?.children[positions[index]];
  }
  if (copy?.localName === element.localName || copy?.localName === 'deny-' + element.localName) {
    return copy;
  }
}
