// ==UserScript==
// @name Кинозал
// @description Торрент трекер Кинозал.ТВ - фильмы, новинки кино, скачать фильмы, афиша кино.
// @icon data:image/webp;base64,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
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/kinozal.js
// @trackerURL https://kinozal.guru
// @version 1.0.8
// @requestMode tab
// @connect *://kinozal.guru
// @require exKit
// ==/UserScript==

const code: PackagedTracker = {
  version: 3,
  type: 'kit',
  description: {
    icon: 'data:image/webp;base64,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',
    name: 'Кинозал',
    description: 'Торрент трекер Кинозал.ТВ - фильмы, новинки кино, скачать фильмы, афиша кино.',
    downloadUrl: 'https://github.com/Feverqwe/tSearch/raw/master/src/trackers/kinozal.js',
    version: '1.0.8',
  },
  search: {
    url: 'https://kinozal.guru/browse.php',
    method: 'GET',
    query: 's=%search%',
  },
  auth: {
    url: 'https://kinozal.guru/login.php',
    loginForm: {selector: 'form[action="/takelogin.php"] input[type="password"]'},
  },
  selectors: {
    row: {selector: 'table.t_peer tbody tr'},
    skipFromStart: 1,
    categoryTitle: {
      selector: 'td.bt img',
      pipeline: [{name: 'getAttr', args: ['src']}],
    },
    categoryUrl: {
      selector: 'td.bt img',
      pipeline: [{name: 'getAttr', args: ['src']}],
    },
    title: {selector: 'td.nam > a', pipeline: [{name: 'getText'}]},
    url: {
      selector: 'td.nam > a',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
    size: {
      selector: 'td:eq(3)',
      pipeline: [{name: 'getText'}, {name: 'legacySizeFormat'}],
    },
    seeds: {
      selector: 'td.sl_s',
      pipeline: [{name: 'getText'}, {name: 'toInt'}],
    },
    peers: {
      selector: 'td.sl_p',
      pipeline: [{name: 'getText'}, {name: 'toInt'}],
    },
    date: {
      selector: 'td:eq(6)',
      pipeline: [
        {name: 'getText'},
        {name: 'legacyReplaceToday'},
        {name: 'legacyParseDate', args: ['1']},
      ],
    },
    nextPageUrl: {
      selector: 'div.paginator a[rel="next"]',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
  },
};

const categoryNameList = function (n: number) {
  const map: Record<number, string> = {
    1: 'Другое - Видеоклипы',
    2: 'Другое - АудиоКниги',
    3: 'Музыка - Буржуйская',
    4: 'Музыка - Русская',
    5: 'Музыка - Сборники',
    6: 'Кино - Боевик / Военный',
    7: 'Кино - Классика',
    8: 'Кино - Комедия',
    9: 'Кино - Исторический',
    10: 'Кино - Наше Кино',
    11: 'Кино - Приключения',
    12: 'Кино - Детский / Семейный',
    13: 'Кино - Фантастика',
    14: 'Кино - Фэнтези',
    15: 'Кино - Триллер / Детектив',
    16: 'Кино - Эротика',
    17: 'Кино - Драма',
    18: 'Кино - Документальный',
    20: 'Мульт - Аниме',
    21: 'Мульт - Буржуйский',
    22: 'Мульт - Русский',
    23: 'Другое - Игры',
    24: 'Кино - Ужас / Мистика',
    32: 'Другое - Программы',
    35: 'Кино - Мелодрама',
    37: 'Кино - Спорт',
    38: 'Кино - Театр, Опера, Балет',
    39: 'Кино - Индийское',
    40: 'Другое - Дизайн / Графика',
    41: 'Другое - Библиотека',
    42: 'Музыка - Классическая',
    45: 'Сериал - Русский',
    46: 'Сериал - Буржуйский',
    47: 'Кино - Азиатский',
    48: 'Кино - Концерт',
    49: 'Кино - Передачи / ТВ-шоу',
    50: 'Кино - ТВ-шоу Мир',
  };
  return map[n];
};

const categoryIconPattern = /\/([0-9]+)\./;

code.hooks = {
  onAfterRequest(_session, response) {
    if (new URL(response.url).pathname === '/login.php') {
      throw Object.assign(new Error('Auth required'), {
        code: 'AUTH_REQUIRED',
        url: code.auth?.url,
      });
    }
  },
};
code.hooks.transform = {};
code.hooks.transform.categoryTitle = (session, result, container) => {
  const m = categoryIconPattern.exec(result as string);
  if (!m) {
    return '';
  }
  const id = parseInt(m[1]);
  return categoryNameList(id);
};
code.hooks.transform.categoryUrl = (session, result, container) => {
  const m = categoryIconPattern.exec(result as string);
  if (!m) {
    return '';
  }
  const id = parseInt(m[1]);
  return '?c=' + id;
};
API_exKit(code);
