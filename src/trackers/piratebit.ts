// ==UserScript==
// @name Piratbit
// @trackerURL https://pb.wtf
// @icon data:image/webp;base64,UklGRj4EAABXRUJQVlA4TDIEAAAvL8ALEG8HIZJs18rMnnv//4Af/NtJCtJdogeIjSQpkjK6D/139J75N9hGktSo0S4xEQUhkL/xWpBN2pA5ae+g30CTgAHzbyD8eRDMLJkhwREMSIaYIHI5gSACe8k+KWuUIInJgsGIGDAil7MZjlmeXDCOwEjMOtknpqyRYaRrZ52BkbUyRCYZM65nDhOAk8UkF7fxcGccpiQCZ10xBUJioJzsE1iHAM1liSlrBBFzaILMyJgVMjp2OBhYw5QEEmgg4SDQJAYaMIaD0E8vEoXmBExCP1BoSvL7hk60Xw/+wgJgsFhwHhoOjd9mNr5f/hPH4P9Dx+J2vf3M9y9Pr15fPP5k0N+2/7DcvOc7jG3bNmvbSM3UqbXdmnFqxD6dznSW37W9s4dB3dj5I2a+mD1Nf4/ovwO3kRTJOcbl2Tec/x907vyxk4cr8mk7y684fPLY+XPM5fihRBnNQGWJQ8eZ69HGhgKakQoaGo8GTiQKqO3YDpudw8txHNm0FCROBI6UU9rcxtdcZtmsSsG0eDW2Q/3KjwQqKa38NCv7HabsL3Ylmy1fUeVP3LRkZ334XSxmM5MeKKQ5zTPAR8bd+EnCpdSJvwBBQy57Ne76CgPUN4eYhA1At4fbHN+LxCBsEQB3twUX3mzoAIJJiqhmBE8mLB80dloIiKljecKSYdJUQFcHflsTZXATA+jqyNNVORKiTCxP7eQYXbsiSMXLcUdMw9g3337v2VFQYZDrEjsYBm4989kHc6HBxCOpqMzkpljTwZd0AgNLvN2xgIn7D9L9H5mEmLg9LTVx56/R4h8HgYgt+3Nb9Zpe8N0RQrTMrdk4DKrYfekdTat6tsvQMFZnWv3q3oE7wxouc+/fm72VHQkx8HgyzEd2F28cHFgq8ODvXvxmGMTosrLJlv5Qc7zp4ApdjRhYzCGYctWV00E0HbckLCoz+vkVrzw1nNlOro7vEG6HBMC1p0pzaOjt0MBjgu1QNQyddLzs/X1uXrj9QieATgZ8UxvlaKZpEm3E1e/G7JD7EdE6KXiC349EdX46/kso8Ov+aMyhLBUz77rt+v5QTZgfN9uhXu424abgOMAx8dAf3oHXe5NIB1yTssRUjHkjK/vztdGkZ1GRe/7Zujc2D7pGppYU5cj3I6+5KTiOMfjtcK/dcgkMFeM2VcpM3OFatptDqZx3MWOLXLQsh1J6IWi9KJOW/bV9j3dpJj3wW0OqaiK0TNFxw9m3XrscGjRMK6VF7SY+FpIrkhbNEE33dcJzCZE5xDTIJCliEC5V74hF/7qUUeibBb/x8htx87+vc9lxpNK3oHu/vj2m/izTvV8ftr7DFz5TUptLaSU3DpZ9vX7DhnVf5UjG4S3rN3B9+YOXoLnBOMiPs7VNfg1UUmWToBrbKmLGWX4cd5lkilxBOfw4nvHzhP/iPOTC7zw=
// @description Крупнейший русскоязычный торрент трекер. фильмы, dvdrip, hdrip, 720p, 1080p, repack, сериалы, mp3...
// @connect *://pb.wtf/*
// @require exKit
// @version 1.0.6
// @requestMode tab
// ==/UserScript==

const code: PackagedTracker = {
  version: 3,
  type: 'kit',
  search: {
    url: 'https://pb.wtf/tracker/',
    method: 'POST',
    body: 'max=1&to=1&ss=%search%',
  },
  auth: {url: 'https://pb.wtf/login.php'},
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
      selector: 'td:eq(1)>a',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    categoryUrl: {
      selector: 'td:eq(1)>a',
      pipeline: [
        {name: 'getAttr', args: ['href']},
        {name: 'replaceRe', args: ['\\r?\\n', ' ']},
        {name: 'trim'},
      ],
    },
    title: {
      selector: 'td:nth-child(3) > a[href^="/t/"]',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    url: {
      selector: 'td:nth-child(3) > a[href^="/t/"]',
      pipeline: [
        {name: 'getAttr', args: ['href']},
        {name: 'replaceRe', args: ['\\r?\\n', ' ']},
        {name: 'trim'},
      ],
    },
    size: {
      selector: 'td:nth-child(4) > div',
      pipeline: [{name: 'getText'}, {name: 'trim'}, {name: 'parseSize'}],
    },
    downloadUrl: {
      selector: 'td:nth-child(4) > div > a[href]',
      pipeline: [
        {name: 'getAttr', args: ['href']},
        {name: 'replaceRe', args: ['\\r?\\n', ' ']},
        {name: 'trim'},
      ],
    },
    seeds: {
      selector: 'td:nth-child(5)',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    peers: {
      selector: 'td:nth-child(6)',
      pipeline: [{name: 'getText'}, {name: 'replaceRe', args: ['\\r?\\n', ' ']}, {name: 'trim'}],
    },
    date: {
      selector: 'td:nth-child(8) > p:first-child',
      pipeline: [
        {name: 'getText'},
        {
          name: 'replaceRe',
          args: ['^\\s*(\\d{1,2}:\\d{2})\\s+(\\d{1,2}-\\d{1,2}-\\d{2,4})\\s*$', '$2 $1'],
        },
        {name: 'legacyParseDate', args: ['1']},
      ],
    },
    nextPageUrl: {
      selector: '.bottom_info .pagination > li.active + li > a[href]',
      pipeline: [
        {name: 'getAttr', args: ['href']},
        {name: 'replaceRe', args: ['\\r?\\n', ' ']},
        {name: 'trim'},
      ],
    },
  },
};

API_exKit(code);
