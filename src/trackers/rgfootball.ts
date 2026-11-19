// ==UserScript==
// @name rgFootball
// @trackerURL https://rgfootball.net/
// @icon data:image/webp;base64,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
// @description Спортивный торрент трекер.
// @connect *://rgfootball.net/*
// @require exKit
// @version 1.0.5
// ==/UserScript==

const code: PackagedTracker = {
  version: 3,
  type: 'kit',
  search: {
    url: 'https://rgfootball.net/tracker.php',
    method: 'GET',
    query: 'nm=%search%',
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
      selector: 'td.med.tLeft a',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    url: {
      selector: 'td.med.tLeft a',
      pipeline: [
        {name: 'getAttr', args: ['href']},
        {name: 'replaceRe', args: ['\\r?\\n', ' ']},
        {name: 'trim'},
      ],
    },
    size: {
      selector: 'td.small.nowrap:eq(0)>u',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    downloadUrl: {
      selector: 'td.small.nowrap:eq(0)>a',
      pipeline: [
        {name: 'getAttr', args: ['href']},
        {name: 'replaceRe', args: ['\\r?\\n', ' ']},
        {name: 'trim'},
      ],
    },
    seeds: {
      selector: 'td.seedmed',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    peers: {
      selector: 'td.leechmed',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    date: {
      selector: 'td.small.nowrap:eq(1)>u',
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
