// ==UserScript==
// @name UnionGang
// @version 1.3
// @description Приватный трекер релиз-группы Электричка
// @trackerURL https://uniongang.org/
// @connect https://uniongang.org/*
// @require exKit
// @requestMode tab
// ==/UserScript==

const code = {
  version: 3,
  type: 'kit',
  search: {
    url: 'https://uniongang.org/browse.php?search=%search%',
    method: 'GET',
  },
  auth: {
    url: 'https://uniongang.org/login.php',
    loginForm: {
      selector: "form[action='takelogin.php'] input[name='password']",
    },
  },
  selectors: {
    nextPageUrl: {selector: 'ul[data-href][data-startpage][data-totalpages]'},
    row: {
      selector: "table.brws.main > tbody > tr:has(> td table a[href^='details.php?id='])",
    },
    title: {
      selector: "td table a[href^='details.php?id=']",
      pipeline: [{name: 'getText'}, {name: 'trim'}],
    },
    url: {
      selector: "td table a[href^='details.php?id=']",
      pipeline: [{name: 'getProp', args: ['href']}],
    },
    size: {
      selector: ':scope > td:nth-of-type(2)',
      pipeline: [
        {name: 'getText'},
        {name: 'trim'},
        {
          name: 'replaceRe',
          args: ['^[\\s\\S]*?(\\d[\\d., ]*\\s*(?:[kmgt]i?b|[кмгт]б))[\\s\\S]*$', '$1'],
        },
        {name: 'legacySizeFormat'},
      ],
    },
    seeds: {
      selector: ':scope > td:nth-of-type(3)',
      pipeline: [
        {name: 'getText'},
        {name: 'trim'},
        {name: 'replaceRe', args: ['^(\\d+)\\s*\\|\\s*\\d+$', '$1']},
        {name: 'toInt'},
      ],
    },
    peers: {
      selector: ':scope > td:nth-of-type(3)',
      pipeline: [
        {name: 'getText'},
        {name: 'trim'},
        {name: 'replaceRe', args: ['^\\d+\\s*\\|\\s*(\\d+)$', '$1']},
        {name: 'toInt'},
      ],
    },
    date: {
      selector: ':scope > td:nth-of-type(5)',
      pipeline: [
        {name: 'getText'},
        {name: 'trim'},
        {name: 'replaceRe', args: ['^[\\s\\S]*?((?:19|20)\\d{2}-\\d{2}-\\d{2})$[\\s\\S]*$', '$1']},
        {name: 'legacyParseDate', args: ['0']},
      ],
    },
  },
};

code.hooks = {
  transform: {
    nextPageUrl(_session, pager) {
      const page = Number(pager?.getAttribute('data-startpage'));
      const count = Number(pager?.getAttribute('data-totalpages'));
      const template = pager?.getAttribute('data-href');
      if (
        !Number.isSafeInteger(page) ||
        !Number.isSafeInteger(count) ||
        page < 1 ||
        page >= count
      ) {
        return null;
      }
      if (!template?.includes('{{number}}')) return null;
      return template.replaceAll('{{number}}', String(page + 1));
    },
  },
};

API_exKit(code);
