import getLogger from "../tools/getLogger";

const DomTreeAdapter = require('dom-treeadapter');

const logger = getLogger('treeAdapter');

class Adapter {
  constructor(document) {
    let proto = this;
    while (proto = proto.__proto__) {
      if (proto.constructor === Adapter) {
        Object.assign(proto, DomTreeAdapter(document));
        break;
      }
    }
  }
}

class TreeAdapter extends Adapter {
  static denyPropsRe = /^(on|src$|srcset$|style$)/i;
  static denyTags = ['NOSCRIPT', 'LINK', 'SCRIPT', 'IFRAME', 'STYLE'];

  createElement(tagName, nameSpaceUri, attrs) {
    attrs.forEach(pair => {
      if (TreeAdapter.denyPropsRe.test(pair.name)) {
        pair.name = 'deny-' + pair.name;
      }
      if (pair.name === 'href' && /^javascript:/.test(pair.value)) {
        pair.value = 'deny-' + pair.value;
      }
    });
    const tagNameU = tagName.toUpperCase();
    if (TreeAdapter.denyTags.indexOf(tagNameU) !== -1) {
      tagName = `DENY_${tagNameU}`;
      const styleAttr = getAttr(attrs, 'style');
      if (styleAttr) {
        styleAttr.value += ';display: none';
      } else {
        attrs.push({
          name: 'style',
          value: 'display: none',
        });
      }
    }

    let element = null;
    try {
      element = document.createElementNS(nameSpaceUri, tagName);
    } catch (err) {
      if (err.name === 'InvalidCharacterError') {
        logger.warn('createElement error: InvalidCharacterError, replaced', tagName, 'div');
        element = document.createElementNS(nameSpaceUri, 'div');
      } else {
        throw err;
      }
    }

    attrs.forEach(pair => {
      try {
        return element.setAttribute(pair.name, pair.value);
      } catch (err) {
        logger.error('setAttribute error', pair);
      }
    });

    if (tagNameU === 'A') {
      element.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        logger.warn('Event: click blocked');
      });
    } else if (tagNameU === 'FORM') {
      element.addEventListener('submit', e => {
        e.preventDefault();
        e.stopPropagation();
        logger.warn('Event: click blocked');
      });
    }

    return element;
  }
}

const getAttr = (attrs, name) => {
  let result = null;
  attrs.some(attr => {
    if (attr.name === name) {
      result = attr;
      return true;
    }
  });
  return result;
};

export default TreeAdapter;