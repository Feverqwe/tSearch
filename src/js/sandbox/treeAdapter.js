import getLogger from "../tools/getLogger";

const debug = getLogger('treeAdapter');
const DomTreeAdapter = require('dom-treeadapter');

class _Adapter {}
Object.assign(_Adapter.prototype, DomTreeAdapter(document));

class TreeAdapter extends _Adapter {
  createElement(tagName, nameSpaceUri, attrs) {
    attrs.forEach(pair => {
      if (/^on/i.test(pair.name)) {
        pair.name = 'DENY-' + pair.name;
      }
    });
    const tagNameU = tagName.toUpperCase();
    if (tagNameU === 'SCRIPT') {
      tagName = 'DENY_SCRIPT';
    } else
    if (tagNameU === 'IFRAME') {
      tagName = 'DENY_IFRAME';
    }
    return super.createElement(tagName, nameSpaceUri, attrs);
  }
}

export default TreeAdapter;