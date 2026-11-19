// ==UserScript==
// @name NoNaMe
// @trackerURL https://nnmclub.to
// @icon data:image/webp;base64,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
// @description Торрент-трекер NNM-Club. Игры, фильмы, музыка mp3 и lossless, программы, отечественные и зарубежные сериалы, книги, мультфильмы и аниме. Рекомендации, обсуждение, рецензии и рейтинги.
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/nnmclub.js
// @connect *://nnmclub.to/*
// @require exKit
// @version 1.1.4
// ==/UserScript==

const code: PackagedTracker = {
  version: 3,
  type: 'kit',
  description: {
    icon: 'data:image/webp;base64,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',
    name: 'NoNaMe',
    description:
      'Торрент-трекер NNM-Club. Игры, фильмы, музыка mp3 и lossless, программы, отечественные и зарубежные сериалы, книги, мультфильмы и аниме. Рекомендации, обсуждение, рецензии и рейтинги.',
    downloadUrl: 'https://github.com/Feverqwe/tSearch/raw/master/src/trackers/nnmclub.js',
    version: '1.1.4',
  },
  search: {
    url: 'https://nnmclub.to/forum/tracker.php',
    method: 'GET',
    query: 'nm=%search%&f=-1',
  },
  selectors: {
    row: {selector: 'table.forumline.tablesorter>tbody>tr'},
    categoryTitle: {
      selector: 'td:eq(1)>a',
      pipeline: [{name: 'getText'}, {name: 'trim'}],
    },
    categoryUrl: {
      selector: 'td:eq(1)>a',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
    title: {
      selector: 'td.genmed>a',
      pipeline: [{name: 'getText'}, {name: 'trim'}],
    },
    url: {
      selector: 'td.genmed>a',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
    size: {
      selector: 'td.gensmall:eq(0)>u',
      pipeline: [{name: 'getText'}, {name: 'trim'}],
    },
    downloadUrl: {
      selector: 'td:eq(4)>a',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
    seeds: {
      selector: 'td.seedmed',
      pipeline: [{name: 'getText'}, {name: 'trim'}],
    },
    peers: {
      selector: 'td.leechmed',
      pipeline: [{name: 'getText'}, {name: 'trim'}],
    },
    date: {
      selector: 'td.gensmall:eq(-1)>u',
      pipeline: [{name: 'getText'}, {name: 'trim'}],
    },
    nextPageUrl: {
      selector: 'table td[align="right"] .nav > b + a[href*="start="]',
      pipeline: [{name: 'getAttr', args: ['href']}],
    },
  },
};

code.flags = {
  auth: 1,
  language: 'ru',
  cyrillic: 1,
};

code.hooks = {};

code.hooks.transform = {};

code.hooks.transform.categoryUrl = (session, value) => {
  if (typeof value !== 'string' || !value) return value;
  const currentPage = new URL(session.response!.url);
  const section = new URL(value, currentPage);
  const query = currentPage.searchParams.get('nm');
  if (
    query === null ||
    section.origin !== currentPage.origin ||
    section.pathname !== currentPage.pathname ||
    !section.searchParams.has('nm')
  ) {
    return value;
  }
  // NNM-Club can garble the search term in links generated from the results page.
  section.searchParams.set('nm', query);
  return section.href;
};

code.hooks.transform.nextPageUrl = (session, value) => {
  const currentPage = new URL(session.response!.url);
  const nextPage = new URL(value as string, currentPage);
  const offset = nextPage.searchParams.get('start');
  if (offset === null) return '';
  // The site can garble non-ASCII terms when it builds pagination links.
  currentPage.searchParams.set('start', offset);
  return currentPage.href;
};

API_exKit(code);
