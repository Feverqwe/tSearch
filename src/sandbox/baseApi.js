import exKitRequestOptionsNormalize from "../tools/exKitRequestOptionsNormalize";

class BaseApi {
  constructor(api, transport) {
    this.api = api;
    this.transport = transport;

    this.public = {
      API_getDom: getDom.bind(this),
      API_sanitizeHtml: sanitizeHtml.bind(this),
      API_deSanitizeHtml: sanitizeHtml.bind(this),
      API_normalizeUrl: normalizeUrl.bind(this),
      API_getDoc: getDoc.bind(this),
      API_event: this.event.bind(this),
      API_getInfo: this.getInfo.bind(this),
      API_request: this.request.bind(this),
    };
  }

  event(name, callback) {
    this.api.events[name] = function (query) {
      return Promise.resolve().then(function () {
        return callback(query);
      });
    };
  };

  getInfo() {
    return this.api.info;
  };

  request(rawOptions) {
    const {options, toJson} = exKitRequestOptionsNormalize(rawOptions);

    return this.transport.callFn('request', [options]).then(response => {
      if (toJson) {
        response.body = JSON.parse(response.body);
      }

      return response;
    });
  };
}

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
const normalizeUrl = (location, link) => {
  if (/^[^:\/]+:/.test(link)) {
    return link;
  }

  let linkNormalizer = linkNormalizerCache[location];
  if (!linkNormalizer) {
    linkNormalizer = linkNormalizerCache[location] = new LinkNormalizer(location);
  }

  return linkNormalizer.getUrl(link);
};

/**
 * @deprecated
 */
const getDom = html => {
  return (new DOMParser()).parseFromString(html, 'text/html');
};

/**
 * @deprecated
 */
const sanitizeHtml = a => a;

/**
 * @param {string} html
 * @param {string} location
 * @returns {Document}
 */
const getDoc = (html, location) => {
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

export default BaseApi;