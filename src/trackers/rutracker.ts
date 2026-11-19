// ==UserScript==
// @name Рутрекер
// @description Крупнейший русскоязычный битторрент трекер. Скачать бесплатно фильмы, музыку, книги, программы..
// @icon data:image/webp;base64,UklGRhgEAABXRUJQVlA4TAsEAAAvH8AHEB65tW2rdqNSNPS2GTN3wPYWKzdz5MwduBE34AI48tgfpJbefffrd3AyMx5DplChKacCmJlDuma+Y0iubVu1ojd4dyMBQN/d7fHXjwF3qapcqqe5WAyuPfeFE4XkatuWR5nKNJN73FcOf+7sWFEBBdAJHdCAu60d7gjSAhwAAMtIh7dt27Zt27ZtW5O12bZt27ZtZAJsVCFIEBxrLwQK8YZUQ7DbA1GEXEMeIcJtgdBBZiDAIV7tgBBBqtwdUgNBGIXbEFQICgQRAjsHwYLIQTogf+4OOYIwjwKEC9IF6YO0XroPGYc8eRCS8b41CCVkzqMhLxB/CFpLBlGH3Ec55ANSD9GDkJ6rUjRVdFHENIPAIQmQ/xDksjjf6oOcurtDviDrkByICgQ5oAhVLFb8V6xW5DCDEEPGAtcnfTk1XLD2WWDK5wtVnI0PPfgZQhMwxVxFkBV3FB0VCQziESguRu3zt9/JsjU77F5ZOhUXI5fn7v4QMgyRPxdSTMs5K34pLg5X04g5b3flIM+l4nLTv3tlGUwCbM0O5u29kiwuRsXukFtI/HGrVIzM5UaHEwufHsoWZ9y7O864m/ZyItvdLLpT6m7mjbNf3BfC2XgRcgLROtdRrUCqFRMCzWpaMu3btt5zdy8uRl1zj5/JsDW7IYFE+u1uFolTPl1IdN2uKlikIrJiY0nxe2+3Zp1X40x3hzwWF1v63c0iLqWUSJ/dq/OinoX/3N2rc1S2f8NIsEOHSNCSooTiTaleO7fiyalEccaePyzO2S7OsN907wEGqbaUEumK1EeqIJWfJlWSksxMkUqxN5eb1bR08u9ttV+dV+Pqrgvs1zw4E6kX/Rr1oL+ovcgIBUn/pBIzRX7FgRxUcWfbyB2VjffPhbf3DerD1TS1Xrsw1ih3S4aaL+qkpxhSD4lCEVHRRHEvV6p4Va/dUHzNOSve7em5p76ovUgm/VWR9kiCphiu+JJbrmUyu7X3odDi9ry64inJ1kzRWrFN8VDxq5VcL0P95rHHQkuYTYZIwyRsM/uiSKuopZiuuDUWlxvlTvpA802X9BYgpVqlIr1iqeJf6JridS2T5XoZpuplGKmXYXCkvklbuvBRhvQQIAVUmSK+YkvgkGJorUw4t/Q/4tg4/UR69dxr2aULH+UHm68apCYSCL6OMEUZxcecs+KaorjZEmYOS5jd7SM9kz5TmDRIwohQRFfsyfnbuJmRNEjfKZJ0TxKKMEWfnBUzFRHMjKRC+kopkf5It6RN0h7pNaVECo1RZFe8VFxWpDUze342JdLBbxIPiYREQZIlpZDmzpLaScgRikiKweNWJumQfi6ROkh8ViZBSfgkteckeIQpQi1IUiedkxLvWFtJuJffWTwA
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/rutracker.js
// @trackerURL https://rutracker.org
// @version 1.0.11
// @requestMode tab
// @connect *://rutracker.org
// @require exKit
// ==/UserScript==

const code: PackagedTracker = {
  version: 3,
  type: 'kit',
  description: {
    icon: 'data:image/webp;base64,UklGRhgEAABXRUJQVlA4TAsEAAAvH8AHEB65tW2rdqNSNPS2GTN3wPYWKzdz5MwduBE34AI48tgfpJbefffrd3AyMx5DplChKacCmJlDuma+Y0iubVu1ojd4dyMBQN/d7fHXjwF3qapcqqe5WAyuPfeFE4XkatuWR5nKNJN73FcOf+7sWFEBBdAJHdCAu60d7gjSAhwAAMtIh7dt27Zt27ZtW5O12bZt27ZtZAJsVCFIEBxrLwQK8YZUQ7DbA1GEXEMeIcJtgdBBZiDAIV7tgBBBqtwdUgNBGIXbEFQICgQRAjsHwYLIQTogf+4OOYIwjwKEC9IF6YO0XroPGYc8eRCS8b41CCVkzqMhLxB/CFpLBlGH3Ec55ANSD9GDkJ6rUjRVdFHENIPAIQmQ/xDksjjf6oOcurtDviDrkByICgQ5oAhVLFb8V6xW5DCDEEPGAtcnfTk1XLD2WWDK5wtVnI0PPfgZQhMwxVxFkBV3FB0VCQziESguRu3zt9/JsjU77F5ZOhUXI5fn7v4QMgyRPxdSTMs5K34pLg5X04g5b3flIM+l4nLTv3tlGUwCbM0O5u29kiwuRsXukFtI/HGrVIzM5UaHEwufHsoWZ9y7O864m/ZyItvdLLpT6m7mjbNf3BfC2XgRcgLROtdRrUCqFRMCzWpaMu3btt5zdy8uRl1zj5/JsDW7IYFE+u1uFolTPl1IdN2uKlikIrJiY0nxe2+3Zp1X40x3hzwWF1v63c0iLqWUSJ/dq/OinoX/3N2rc1S2f8NIsEOHSNCSooTiTaleO7fiyalEccaePyzO2S7OsN907wEGqbaUEumK1EeqIJWfJlWSksxMkUqxN5eb1bR08u9ttV+dV+Pqrgvs1zw4E6kX/Rr1oL+ovcgIBUn/pBIzRX7FgRxUcWfbyB2VjffPhbf3DerD1TS1Xrsw1ih3S4aaL+qkpxhSD4lCEVHRRHEvV6p4Va/dUHzNOSve7em5p76ovUgm/VWR9kiCphiu+JJbrmUyu7X3odDi9ry64inJ1kzRWrFN8VDxq5VcL0P95rHHQkuYTYZIwyRsM/uiSKuopZiuuDUWlxvlTvpA802X9BYgpVqlIr1iqeJf6JridS2T5XoZpuplGKmXYXCkvklbuvBRhvQQIAVUmSK+YkvgkGJorUw4t/Q/4tg4/UR69dxr2aULH+UHm68apCYSCL6OMEUZxcecs+KaorjZEmYOS5jd7SM9kz5TmDRIwohQRFfsyfnbuJmRNEjfKZJ0TxKKMEWfnBUzFRHMjKRC+kopkf5It6RN0h7pNaVECo1RZFe8VFxWpDUze342JdLBbxIPiYREQZIlpZDmzpLaScgRikiKweNWJumQfi6ROkh8ViZBSfgkteckeIQpQi1IUiedkxLvWFtJuJffWTwA',
    name: 'Рутрекер',
    description:
      'Крупнейший русскоязычный битторрент трекер. Скачать бесплатно фильмы, музыку, книги, программы..',
    downloadUrl: 'https://github.com/Feverqwe/tSearch/raw/master/src/trackers/rutracker.js',
    version: '1.0.11',
  },
  search: {
    url: 'https://rutracker.org/forum/tracker.php',
    method: 'POST',
    query: 'nm=%search%',
    body: 'nm=%search%',
  },
  auth: {
    url: 'https://rutracker.org/forum/login.php',
    loginForm: {selector: '#login-form-full'},
  },
  selectors: {
    row: {selector: '#tor-tbl>tbody>tr'},
    categoryTitle: {
      selector: 'td.row1.f-name-col > div > a',
      pipeline: [{name: 'getText'}],
    },
    categoryUrl: {
      selector: 'td.row1.f-name-col>div>a',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
    title: {
      selector: 'div.wbr.t-title > a',
      pipeline: [{name: 'getText'}],
    },
    url: {
      selector: 'div.wbr.t-title > a',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
    size: {
      selector: 'td.row4.small.nowrap.tor-size',
      pipeline: [{name: 'getAttr', args: ['data-ts_text']}, {name: 'toInt'}],
    },
    downloadUrl: {
      selector: 'td.row4.small.nowrap.tor-size>a',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
    seeds: {
      selector: 'td.row4.nowrap:eq(1)',
      pipeline: [{name: 'getAttr', args: ['data-ts_text']}, {name: 'toInt'}],
    },
    peers: {
      selector: 'td.row4.leechmed',
      pipeline: [{name: 'getText'}, {name: 'toInt'}],
    },
    date: {
      selector: 'td.row4.small.nowrap:eq(1)',
      pipeline: [{name: 'getAttr', args: ['data-ts_text']}, {name: 'toInt'}],
    },
    nextPageUrl: {
      selector: 'div.nav > p > b + a.pg[href*="start="]',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
  },
};

code.flags = {
  auth: 1,
  language: 'ru',
  cyrillic: 1,
};

code.hooks = {
  onAfterRequest(_session, response) {
    if (new URL(response.url).pathname === '/forum/login.php') {
      throw Object.assign(new Error('Auth required'), {
        code: 'AUTH_REQUIRED',
        url: code.auth?.url,
      });
    }
  },
};

code.hooks.transform = {};

code.hooks.transform.nextPageUrl = (session, value) => {
  const current = new URL(session.response!.url);
  const next = new URL(value as string, current);
  const query = current.searchParams.get('nm');
  if (query !== null) next.searchParams.set('nm', query);
  return next.href;
};

API_exKit(code);
