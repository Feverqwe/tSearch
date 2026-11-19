class LinkNormalizer {
  private readonly doc: Document;
  private readonly link: HTMLAnchorElement;

  constructor(location: string) {
    this.doc = document.implementation.createHTMLDocument('');

    const base = this.doc.createElement('base');
    base.href = location;
    this.doc.head.appendChild(base);

    this.link = document.createElement('a');
    this.doc.body.appendChild(this.link);
  }
  getUrl(href: string) {
    this.link.setAttribute('href', href);
    return this.link.href;
  }
}

const linkNormalizerCache: Record<string, LinkNormalizer> = Object.create(null);

const exKitNormalizeUrl = (location: string, link: string) => {
  if (/^[^:\/]+:/.test(link)) {
    return link;
  }

  let linkNormalizer = linkNormalizerCache[location];
  if (!linkNormalizer) {
    linkNormalizer = linkNormalizerCache[location] = new LinkNormalizer(location);
  }

  return linkNormalizer.getUrl(link);
};

export default exKitNormalizeUrl;
