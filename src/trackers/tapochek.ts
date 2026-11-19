// ==UserScript==
// @name Tapochek
// @trackerURL https://tapochek.net
// @icon data:image/webp;base64,UklGRq4FAABXRUJQVlA4TKEFAAAvH8AHEA0waNtIUpq9v8Of8C2IiP5PAN3irhaC2lYerddYnUVUJ0mU/MuAcds2ktx/rTO73NvY33TBKpJkJ/0i94kE/AvKCIgaKMZt2wbiM6iToPtP2OfdBv3PcLPCev96eXldkcwRBFE4HZHs9GQNABE9aufs7HRA1shR5zRq/i8AyTkyeXLOUBkBkDfndlKV69P/UlA6KeKJ6Mr/p8hWembWL+7u7u4eOjEpGdG9xO7ukBERubu7u7u7O6zNdDCLPMIPh/jU1NYkE+F+pKuOZfhkVGf7BluNdoo7kx1NN7vVb0C60WS4pQ4vMYnc2taWLTrn+XCHAuiAiAYpg5AQSiByl5HM3d195rlwa9tWray1b/Rxd2iBBhwiQgYNeOqa0hm/Ekqw9A/ugRoIAILokA3cnU5iBYctLDmNxgy+Bi8r/I/wmf7SXCaAQGCaR4+Vsb99TseeZJAqIhTgTiWIytclqYfLrCOBe0z78K62+KODpxO+T7ECTeHOvlysp78z33gfEghM/GO4Pe/ngDz0w7KdXzW6gIagAXgAEQBIAEIBRZDoivHv6jRULN+j5/l3TqqTzox6cudXWxa7ONbVoEWKc+YxlOwqd0HSgKqvTLTir4GHD7CZb/90NuSocN6PxihlCowrzrVAaQlVRKaK4kpLoRUkanW6ZCuNCsEV6EY0ojKrZSj8wxCv6kDpAVGMR4ygrpHRMCovLlauTkGX0yXFYF3FEdwqoEeiocqNgCE0GrRkGvMH04mbxLriWmV011pD42AhdVSrAoD6OIo4t1ACFFBoEkk0UsFA7sZ0p4h0OqsVLxUiNNLAKtQikAiACGpcFMBGhQvV5mjg5oelbmKzx7jlHyQOBfurS8Ea4ozSXnQDtwprrAkdha0AogYjYt+Ooq5XrnuCuPQnpJRATn1yXYXrbmmx/iP4tVH4AFD9OIpi6EbjJOG6riwBuO7Naj2ll0QkOIAyRCC4KAarJa5Gt8tSW4FBmyWphAiEAgAVRbwWhQYAgHPB5eKEiqwBSAts9TQGXYsno9CNYP9Y/FrJlpqnEUMr4Ns90eEiC7YMNkVXK1Agz/2upW6g0CoQAUHCs5FS8PDIpRnBkGhCAeBUdEiKoQYkEsF5aG8DUv5/+uey6LJmWBJJQCNg96MXxm7MZYH9AuE9iXqqy6Xo5goKpJTTLGnyeV3yQxHzbRohSMrdKLnHoMNQWnEondIFe94QIoCd8f5zjS2DYSlXAgDnG3shXqfABJMKIoAcOqxxObqU6DeHYMrG9SAGbk13Ync549AGAJy/9ucJFVOTUzIReQXgPLBzIA3jiyL42CsRsXoSDEE5C1wTAMCQa7NGV0mhyHMAlRM7jES8IC2hGW/6Np8D+GrHobmlApBSStjdkVQMVDnnPuykwIF/hzRuBLhdGmX2dJN09zDnXBPKBgYgDi4HyIGHTv+Ex2xXRqeLixGejhkBY8yHvcqBhmvBJuqsdBcGO6SsdxNb348b/knisOhYdBN47xiwhzpNxBHnnJVgBDEgVnC8ICFaY8GiYFSFrcTF6vdidO/dmh3nYdUrAUA5qAeizltnR+OibMWu6W4RVFQ6Kw9D+X8A8IBm1gUfjfWgsSYSKgG+zVLu/vdbK6hYkQJY6MCihzQMwjUDAZQIftUSiqTAHBqL7tvOt9+WUlbMDn2QyEv4mk/5kMfe0srr0WUIA4jGb0SjHjQGGmilQefr375d6Yy0UqQXttho5F7bGJud9b7Pvy7H3Ia88mNc/6dp4D4PmRapkDnKcbucLseVrbRhVJE3fWmWWLm9pnqucUyG5wU9f9zpuLvkfZcZ4BAKNfwyPJRs9VH23LIf/nTsdSy5+vw2utsTAtlbR7+vyZ6pT/B9b7Nwbm6HtMUcBfgKgAegDJCICsBRRep9htGz3dC90SSQJ5ACAA==
// @description Игровой торрент-трекер.
// @connect *://tapochek.net/*
// @require exKit
// @version 1.0.7
// ==/UserScript==

const code: PackagedTracker = {
  version: 3,
  type: 'kit',
  search: {
    url: 'https://tapochek.net/tracker.php',
    method: 'GET',
    query: 'nm=%search%',
  },
  auth: {
    url: 'https://tapochek.net/login.php',
    loginForm: {
      selector: 'form[action$="login.php"] input[type="password"][name="login_password"]',
    },
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
      selector: 'td.med.tLeft>a',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    url: {
      selector: 'td.med.tLeft>a',
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
