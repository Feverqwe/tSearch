class LinkNormalizer {
  constructor(location) {
    this.doc = document.implementation.createHTMLDocument('');

    const base = this.doc.createElement('base');
    base.href = location;
    this.doc.head.appendChild(base);

    this.link = document.createElement('a');
    this.doc.body.appendChild(this.link);
  }
  getUrl(href) {
    this.link.setAttribute('href', href);
    return this.link.href;
  }
}

const linkNormalizerCache = {};
/**
 * @param {string} location
 * @param {string} link
 * @returns {string}
 */
const exKitNormalizeUrl = (location, link) => {
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