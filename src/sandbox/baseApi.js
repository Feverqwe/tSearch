/**
 * @param {string} html
 * @returns {Document}
 */
window.API_getDom = function (html) {
  return (new DOMParser()).parseFromString(html, 'text/html');
};

/**
 * @param {string} a
 * @returns {string}
 * @deprecated
 */
window.API_sanitizeHtml = a => a;

/**
 * @param {string} a
 * @returns {string}
 * @deprecated
 */
window.API_deSanitizeHtml = a => a;

(function () {
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
  window.API_normalizeUrl = function (location, link) {
    if (/^[^:\/]+:/.test(link)) {
      return link;
    }

    let linkNormalizer = linkNormalizerCache[location];
    if (!linkNormalizer) {
      linkNormalizer = linkNormalizerCache[location] = new LinkNormalizer(location);
    }

    return linkNormalizer.getUrl(link);
  };
})();

/**
 * @param {string} html
 * @param {string} location
 * @returns {Document}
 */
window.API_getDoc = (html, location) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const base = doc.head.querySelector('base');
  if (!base) {
    const base = doc.createElement('base');
    base.href = location;
    doc.head.appendChild(base);
  }

  return doc;
};

export default null;