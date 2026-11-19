import {type DefaultTreeAdapterTypes, parse} from 'parse5';

type ChildNode = DefaultTreeAdapterTypes.ChildNode;

const blockedTags = new Set([
  'base',
  'embed',
  'iframe',
  'link',
  'meta',
  'noscript',
  'object',
  'script',
  'style',
  'template',
]);
const blockedAttributes =
  /^(on|src|(?:style|href|action|formaction|data|poster|background|ping|bgcolor|color|text|link|vlink|alink)$)/i;

function copyNode(document: Document, node: ChildNode): Node | undefined {
  if (node.nodeName === '#text' && 'value' in node) return document.createTextNode(node.value);
  if (!('tagName' in node)) return;

  const tag = node.tagName;
  const element = document.createElementNS(
    node.namespaceURI,
    blockedTags.has(tag) ? `deny-${tag}` : tag,
  );
  if (blockedTags.has(tag)) element.setAttribute('hidden', '');
  for (const {name, value} of node.attrs) {
    if (blockedAttributes.test(name)) element.setAttribute(`data-preview-${name}`, value);
    else element.setAttribute(name, value);
  }
  for (const child of node.childNodes) {
    const copy = copyNode(document, child);
    if (copy) element.appendChild(copy);
  }
  return element;
}

// Parse into inert data before attaching any of the source HTML to an extension document.
export default function getDoc5(html: string, location: string, document: Document): Document {
  const preview = document.implementation.createHTMLDocument();
  const root = parse(html).childNodes.find((node) => node.nodeName === 'html');
  const copy = root && copyNode(preview, root);
  if (copy) preview.replaceChild(copy, preview.documentElement);
  const base = preview.createElement('base');
  base.href = location;
  preview.head.appendChild(base);
  return preview;
}
