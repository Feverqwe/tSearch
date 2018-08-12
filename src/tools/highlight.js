import React from 'react';
import escapeRegExp from 'lodash.escaperegexp';
import sortByLength from "./sortByLength";
import isBoundary from "./isBoundary";

const adapter = {
  createDocumentFragment() {
    return {
      nodeType: 11,
      childNodes: [],
      appendChild: adapter.appendChild
    };
  },
  createTextNode(text) {
    return {
      nodeType: 3,
      parentNode: null,
      textContent: text
    }
  },
  createElement(tagName) {
    return {
      nodeType: 1,
      parentNode: null,
      childNodes: [],
      appendChild: adapter.appendChild,
      tagName: tagName
    }
  },
  appendChild(node) {
    const pos = this.childNodes.indexOf(node);
    if (pos !== -1) {
      this.childNodes.splice(pos, 1);
    }
    this.childNodes.push(node);
    node.parentNode = this;
  }
};

const highlight = {
  getMap(query) {
    const words = query.split(/\s+/);
    const wordsRe = [];
    for (let i = 0, len = words.length; i < len; i++) {
      const word = words[i];
      if (word) {
        wordsRe.push(escapeRegExp(word));
      }
    }

    wordsRe.sort(sortByLength);

    return wordsRe.length && new RegExp(wordsRe.join('|'), 'ig');
  },
  getHlMap(string, map, posMap) {
    string.replace(map, function (word, pos) {
      const wordLen = word.length;
      if (wordLen && isBoundary(string[pos - 1], string[pos + wordLen])) {
        posMap.push(['b', pos]);
        posMap.push(['b', pos + wordLen, true]);
      }
    });
  },
  getBracketsMap(string, posMap) {
    string.replace(/\([^)]*\)|\[[^\]]*]|<[^>]*>|{[^}]*}/g, function (word, pos) {
      const wordLen = word.length;
      if (wordLen) {
        posMap.push(['span', pos]);
        posMap.push(['span', pos + wordLen, true]);
      }
    });
  },
  getTextMap(/**String*/str, map) {
    const posMap = [];
    map && this.getHlMap(str, map, posMap);
    this.getBracketsMap(str, posMap);
    posMap.sort(function (a, b) {
      return a[1] === b[1] ? 0 : a[1] < b[1] ? -1 : 1;
    });
    return posMap;
  },
  getFragment(text, posMap) {
    let fragment, lastPos = 0;
    const root = fragment = adapter.createDocumentFragment();
    let pos;
    for (let i = 0, len = posMap.length; i < len; i++) {
      const item = posMap[i];
      const tagName = item[0];
      pos = item[1];
      const isClose = item[2];
      if (pos !== lastPos) {
        fragment.appendChild(adapter.createTextNode(text.substr(lastPos, pos - lastPos)));
      }
      lastPos = pos;
      if (!isClose) {
        fragment.appendChild(fragment = adapter.createElement(tagName));
      } else {
        fragment = fragment.parentNode || root;
      }
    }
    pos = text.length;
    if (pos !== lastPos) {
      fragment.appendChild(adapter.createTextNode(text.substr(lastPos, pos - lastPos)));
    }

    return fragment;
  },
  getReactComponent(/**String*/tagName, /**Object*/details, text, posMap) {
    const fragment = this.getFragment(text, posMap);
    const getChildNodes = function (childNodes) {
      return Array.from(childNodes).map(function (node) {
        if (node.nodeType === 3) {
          return node.textContent;
        } else {
          const args = getChildNodes(node.childNodes);
          args.splice(0, 0, node.tagName.toLowerCase(), null);
          return React.createElement.apply(React, args);
        }
      });
    };
    const args = getChildNodes(fragment.childNodes);
    args.splice(0, 0, tagName.toLowerCase(), details);
    return React.createElement.apply(React, args);
  }
};

export default highlight;