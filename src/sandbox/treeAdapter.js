import getLogger from "../tools/getLogger";

const DomTreeAdapter = require('dom-treeadapter');

const logger = getLogger('treeAdapter');

class _Adapter {}
Object.assign(_Adapter.prototype, DomTreeAdapter(document));

class TreeAdapter extends _Adapter {
  createElement(tagName, nameSpaceUri, attrs) {
    attrs.forEach(pair => {
      if (/^(on|src$|srcset$|style$)/i.test(pair.name)) {
        pair.name = 'deny-' + pair.name;
      }
      if (pair.name === 'href' && /^javascript:/.test(pair.value)) {
        pair.value = 'deny-' + pair.value;
      }
    });
    const tagNameU = tagName.toUpperCase();
    if (['NOSCRIPT', 'LINK', 'SCRIPT', 'IFRAME', 'STYLE'].indexOf(tagNameU) !== -1) {
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

    const element = super.createElement(tagName, nameSpaceUri, attrs);
    if (tagNameU === 'A') {
      element.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        logger.warn('Event: click blocked');
      });
    } else
    if (tagNameU === 'FORM') {
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