export default function nextPageAfterCurrent(container: Element): string | undefined {
  for (const node of container.childNodes) {
    if (node.nodeType !== 3) continue;
    const current = /(?:^|\s)(\d+)\s*$/.exec(node.textContent ?? '');
    if (!current) continue;
    let sibling = node.nextSibling;
    while (sibling && sibling.nodeType !== 1) sibling = sibling.nextSibling;
    const element = sibling as Element | null;
    const link = element?.matches('a[href]') ? element : element?.querySelector('a[href]');
    if (!link || link.closest('[aria-disabled="true"], .disabled')) continue;
    if (link.textContent?.trim() !== String(Number(current[1]) + 1)) continue;
    const href = link.getAttribute('href')?.trim();
    if (!href || href.startsWith('#')) continue;
    const url = URL.parse(href, link.ownerDocument.baseURI);
    if (url && ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password)
      return url.href;
  }
}
