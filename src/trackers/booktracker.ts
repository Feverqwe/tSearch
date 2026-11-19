// ==UserScript==
// @name Книжный трекер
// @trackerURL https://booktracker.org
// @icon data:image/webp;base64,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
// @description Книжный трекер (booktracker.org), рукописи не горя.
// @connect *://booktracker.org/*
// @require exKit
// @version 1.0.4
// ==/UserScript==

const code: PackagedTracker = {
  version: 3,
  type: 'kit',
  search: {
    url: 'https://booktracker.org/tracker.php',
    method: 'GET',
    query: 'nm=%search%&to=1&max=1',
  },
  auth: {
    url: 'https://booktracker.org/login.php',
  },
  hooks: {
    onAfterRequest(_session, response) {
      if (new URL(response.url).pathname === '/login.php') {
        throw Object.assign(new Error('Auth required'), {
          code: 'AUTH_REQUIRED',
          url: code.auth?.url,
        });
      }
    },
  },
  selectors: {
    row: {selector: '#tor-tbl>tbody>tr'},
    categoryTitle: {
      selector: 'td:eq(2)>a',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    categoryUrl: {
      selector: 'td:eq(2)>a',
      pipeline: [
        {name: 'getAttr', args: ['href']},
        {name: 'replaceRe', args: ['\\r?\\n', ' ']},
        {name: 'trim'},
      ],
    },
    title: {
      selector: 'td.row4.med.tLeft>a',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    url: {
      selector: 'td.row4.med.tLeft>a',
      pipeline: [
        {name: 'getAttr', args: ['href']},
        {name: 'replaceRe', args: ['\\r?\\n', ' ']},
        {name: 'trim'},
      ],
    },
    size: {
      selector: 'td.row4.small.nowrap:eq(0)>u',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    downloadUrl: {
      selector: 'td.row4.small.nowrap:eq(0)>a',
      pipeline: [
        {name: 'getAttr', args: ['href']},
        {name: 'replaceRe', args: ['\\r?\\n', ' ']},
        {name: 'trim'},
      ],
    },
    seeds: {
      selector: 'td.row4.seedmed',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    peers: {
      selector: 'td.row4.leechmed',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    date: {
      selector: 'td.row4.small.nowrap:eq(1)>u',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    nextPageUrl: {
      selector: '#main_content .bottom_info .nav > p > b + a[href*="start="]',
      pipeline: [
        {name: 'getAttr', args: ['href']},
        {name: 'replaceRe', args: ['\\r?\\n', ' ']},
        {name: 'trim'},
      ],
    },
  },
};

API_exKit(code);
