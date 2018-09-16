import $ from 'jquery';
import './baseApi';

const exKit = {
  legacy: {
    varCache: {
      size_check: /[^0-9.,кбмгтkmgtb]/g,
      size_kb: /кб|kb/,
      size_mb: /мб|mb/,
      size_gb: /гб|gb/,
      size_tb: /тб|tb/,
      today_now: /сейчас|now/,
      today_today: /сегодня|today/,
      today_yest: /вчера|yesterday/,
      ex_num: /[^0-9]/g,
      spaces: /\s+/g,
      timeFormat4: /([0-9]{1,2}d)?[^0-9]*([0-9]{1,2}h)?[^0-9]*([0-9]{1,2}m)?[^0-9]*([0-9]{1,2}s)?/
    },
    sizeFormat: function (s) {
      const size = s.toLowerCase().replace(this.varCache.size_check, '').replace(',', '.');
      let t = size.replace(this.varCache.size_kb, '');
      const size_len = size.length;
      if (t.length !== size_len) {
        t = parseFloat(t);
        return Math.round(t * 1024);
      }
      t = size.replace(this.varCache.size_mb, '');
      if (t.length !== size_len) {
        t = parseFloat(t);
        return Math.round(t * 1024 * 1024);
      }
      t = size.replace(this.varCache.size_gb, '');
      if (t.length !== size_len) {
        t = parseFloat(t);
        return Math.round(t * 1024 * 1024 * 1024);
      }
      t = size.replace(this.varCache.size_tb, '');
      if (t.length !== size_len) {
        t = parseFloat(t);
        return Math.round(t * 1024 * 1024 * 1024 * 1024);
      }
      return 0;
    },
    monthReplace: function (t) {
      return t.toLowerCase().replace('янв', '1').replace('фев', '2').replace('мар', '3')
        .replace('апр', '4').replace('мая', '5').replace('май', '5').replace('июн', '6')
        .replace('июл', '7').replace('авг', '8').replace('сен', '9')
        .replace('окт', '10').replace('ноя', '11').replace('дек', '12')
        .replace('jan', '1').replace('feb', '2').replace('mar', '3')
        .replace('apr', '4').replace('may', '5').replace('jun', '6')
        .replace('jul', '7').replace('aug', '8').replace('sep', '9')
        .replace('oct', '10').replace('nov', '11').replace('dec', '12');
    },
    todayReplace: function (t, f) {
      f = parseInt(f);
      t = t.toLowerCase();
      const tt = new Date();
      if ((this.varCache.today_now).test(t)) {
        t = 'today ' + tt.getHours() + ':' + tt.getMinutes();
      }
      const tty = new Date((Math.round(tt.getTime() / 1000) - 24 * 60 * 60) * 1000);
      let today;
      let yesterday;
      if (f === 0) {
        today = tt.getFullYear() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getDate() + ' ';
        yesterday = tty.getFullYear() + ' ' + (tty.getMonth() + 1) + ' ' + tty.getDate() + ' ';
      } else if (f === 3) {
        today = (tt.getMonth() + 1) + ' ' + tt.getDate() + ' ' + tt.getFullYear() + ' ';
        yesterday = (tty.getMonth() + 1) + ' ' + tty.getDate() + ' ' + tty.getFullYear() + ' ';
      } else {
        today = tt.getDate() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getFullYear() + ' ';
        yesterday = tty.getDate() + ' ' + (tty.getMonth() + 1) + ' ' + tty.getFullYear() + ' ';
      }
      t = t.replace(this.varCache.today_today, today).replace(this.varCache.today_yest, yesterday);
      return t;
    },
    dateFormat: function (f, t) {
      if (f === undefined) {
        return ['2013-04-31[[[ 07]:03]:27]', '31-04-2013[[[ 07]:03]:27]', 'n day ago', '04-31-2013[[[ 07]:03]:27]', '2d 1h 0m 0s ago'];
      }
      f = parseInt(f);
      if (f === 0) { // || f === '2013-04-31[[[ 07]:03]:27]') {
        const dd = t.replace(this.varCache.ex_num, ' ').replace(this.varCache.spaces, ' ').trim().split(' ');
        for (let i = 0; i < 6; i++) {
          if (dd[i] === undefined) {
            dd[i] = 0;
          } else {
            dd[i] = parseInt(dd[i]);
            if (isNaN(dd[i])) {
              if (i < 3) {
                return 0;
              } else {
                dd[i] = 0;
              }
            }
          }
        }
        if (dd[0] < 10) {
          dd[0] = '200' + dd[0];
        } else if (dd[0] < 100) {
          dd[0] = '20' + dd[0];
        }
        return Math.round((new Date(dd[0], dd[1] - 1, dd[2], dd[3], dd[4], dd[5])).getTime() / 1000);
      }
      if (f === 1) { //  || f === '31-04-2013[[[ 07]:03]:27]') {
        const dd = t.replace(this.varCache.ex_num, ' ').replace(this.varCache.spaces, ' ').trim().split(' ');
        for (let i = 0; i < 6; i++) {
          if (dd[i] === undefined) {
            dd[i] = 0;
          } else {
            dd[i] = parseInt(dd[i]);
            if (isNaN(dd[i])) {
              if (i < 3) {
                return 0;
              } else {
                dd[i] = 0;
              }
            }
          }
        }
        if (dd[2] < 10) {
          dd[2] = '200' + dd[2];
        } else if (dd[2] < 100) {
          dd[2] = '20' + dd[2];
        }
        return Math.round((new Date(dd[2], dd[1] - 1, dd[0], dd[3], dd[4], dd[5])).getTime() / 1000);
      }
      if (f === 2) { //  || f === 'n day ago') {
        const old = parseFloat(t.replace(this.varCache.ex_num, '')) * 24 * 60 * 60;
        return Math.round(Date.now() / 1000) - old;
      }
      if (f === 3) { //  || f === '04-31-2013[[[ 07]:03]:27]') {
        const dd = t.replace(this.varCache.ex_num, ' ').replace(this.varCache.spaces, ' ').trim().split(' ');
        for (let i = 0; i < 6; i++) {
          if (dd[i] === undefined) {
            dd[i] = 0;
          } else {
            dd[i] = parseInt(dd[i]);
            if (isNaN(dd[i])) {
              if (i < 3) {
                return 0;
              } else {
                dd[i] = 0;
              }
            }
          }
        }
        if (dd[2] < 10) {
          dd[2] = '200' + dd[2];
        } else if (dd[2] < 100) {
          dd[2] = '20' + dd[2];
        }
        return Math.round((new Date(dd[2], dd[0] - 1, dd[1], dd[3], dd[4], dd[5])).getTime() / 1000);
      }
      if (f === 4) { //  || f === '2d 1h 0m 0s ago') {
        const match = t.match(this.varCache.timeFormat4);
        if (match) {
          const d = parseInt(match[1]) || 0;
          const h = parseInt(match[2]) || 0;
          const m = parseInt(match[3]) || 0;
          const s = parseInt(match[4]) || 0;
          const time = d * 24 * 60 * 60 + h * 60 * 60 + m * 60 + s;
          if (time === 0) {
            return 0;
          }
          return parseInt(Date.now() / 1000) - time;
        }
        return 0;
      }
    }
  },
  prepareTrackerR: {
    hasEndSlash: /\/$/
  },
  funcList: {
    encodeCp1251: function (string) {
      let output = '', charCode, ExitValue, char;
      for (let i = 0, len = string.length; i < len; i++) {
        char = string.charAt(i);
        charCode = char.charCodeAt(0);
        let Acode = charCode;
        if (charCode > 1039 && charCode < 1104) {
          Acode -= 848;
          ExitValue = '%' + Acode.toString(16);
        }
        else if (charCode === 1025) {
          Acode = 168;
          ExitValue = '%' + Acode.toString(16);
        }
        else if (charCode === 1105) {
          Acode = 184;
          ExitValue = '%' + Acode.toString(16);
        }
        else if (charCode === 32) {
          Acode = 32;
          ExitValue = '%' + Acode.toString(16);
        }
        else if (charCode === 10) {
          ExitValue = '%0A';
        }
        else {
          ExitValue = char;
        }
        output = output + ExitValue;
      }
      return output;
    },
    idInCategoryList: function (tracker, cId) {
      const mapNameId = {
        serials: 0,
        music: 1,
        games: 2,
        films: 3,
        cartoon: 4,
        books: 5,
        soft: 6,
        anime: 7,
        doc: 8,
        sport: 9,
        xxx: 10,
        humor: 11
      };

      for (let key in tracker.categoryList) {
        const list = tracker.categoryList[key];
        if (list.indexOf(cId) !== -1) {
          return mapNameId[key];
        }
      }

      return -1;
    },
    idInCategoryListInt: function (tracker, url, regexp) {
      let cId = url.match(regexp);
      cId = cId && cId[1];
      if (cId === null) {
        return -1;
      }
      cId = parseInt(cId);
      return this.idInCategoryList(tracker, cId);
    },
    idInCategoryListStr: function (tracker, url, regexp) {
      let cId = url.match(regexp);
      cId = cId && cId[1];
      if (cId === null) {
        return -1;
      }
      return this.idInCategoryList(tracker, cId);
    }
  },
  listToFunction: function (key, list) {
    if (!Array.isArray(list)) {
      return null;
    }

    const funcList = [];
    list.forEach(function (item) {
      if (item.name === 'encode') {
        if (item.type === 'cp1251') {
          funcList.push(function (details) {
            details.query = exKit.funcList.encodeCp1251(details.query);
          });
        }
      } else if (item.name === 'replaceRe') {
        const re = new RegExp(item.re, 'ig');
        funcList.push(function (details, value) {
          return value.replace(re, item.text);
        });
      } else if (item === 'replaceToday') {
        funcList.push(function (details, value) {
          return exKit.funcList.todayReplace(value);
        });
      } else if (item === 'replaceMonth') {
        funcList.push(function (details, value) {
          return exKit.funcList.monthReplace(value);
        });
      } else if (item.name === 'timeFormat') {
        funcList.push(function (details, value) {
          return exKit.funcList.dateFormat(item.format, value);
        });
      } else if (item === 'convertSize') {
        funcList.push(function (details, value) {
          return exKit.funcList.sizeFormat(value);
        });
      }
    });

    if (!funcList.length) {
      return null;
    }

    return function (details, value) {
      for (let i = 0, _func; _func = funcList[i]; i++) {
        try {
          value = _func(details, value);
        } catch (err) {
          value = null;
          console.error('listToFunction error!', err);
          break;
        }
      }
      return value;
    }
  },
  convertV1ToV2: function (code) {
    const obj = {};
    obj.version = 2;
    obj.type = 'kit';
    obj.uid = code.uid;
    obj.icon = code.icon;
    obj.title = code.name;
    obj.desc = code.about;
    const search = obj.search = {};
    const torrentSelector = search.torrentSelector = {};
    const onGetValue = search.onGetValue = {};
    search.searchUrl = code.search_path;
    if (code.root_url) {
      search.baseUrl = code.root_url;
    }
    if (code.auth) {
      search.loginUrl = code.auth;
    }
    if (code.post) {
      search.requestType = 'POST';
      search.requestData = code.post;
    }
    if (code.encode) {
      search.onBeforeRequest = [{name: 'encode', type: 'cp1251'}];
    }
    search.listItemSelector = code.items;
    if (code.charset) {
      search.requestMimeType = 'text/html; charset=' + code.charset;
    }
    if (code.cat_alt) {
      code.cat_attr = 'alt';
      code.cat_alt = undefined;
    }
    if (code.auth_f) {
      search.loginFormSelector = code.auth_f;
    }
    if (code.sf || code.sl) {
      search.listItemSplice = [code.sf || 0, -(code.sl || 0)];
    }
    torrentSelector.title = code.tr_name;
    torrentSelector.url = {selector: code.tr_link, attr: 'href'};
    if (code.cat_name) {
      torrentSelector.categoryTitle = code.cat_name;
      if (code.cat_attr) {
        torrentSelector.categoryTitle = {
          selector: torrentSelector.categoryTitle,
          attr: code.cat_attr
        };
      }
      if (code.cat_link) {
        torrentSelector.categoryUrl = {selector: code.cat_link, attr: 'href'};
      }
    }
    if (code.tr_size) {
      torrentSelector.size = code.tr_size;
      if (code.size_attr) {
        torrentSelector.size = {selector: torrentSelector.size, attr: code.size_attr};
      }

      const sizeFuncList = [];
      if (code.size_r && code.size_rp !== undefined) {
        sizeFuncList.push({
          name: 'replaceRe',
          re: code.size_r,
          text: code.size_rp
        });
      }
      if (code.s_c) {
        sizeFuncList.push('convertSize');
      }
      if (sizeFuncList.length) {
        onGetValue.size = sizeFuncList;
      }
    }
    if (code.tr_dl) {
      torrentSelector.downloadUrl = {selector: code.tr_dl, attr: 'href'};
    }
    if (code.seed) {
      torrentSelector.seed = code.seed;
      if (code.seed_r) {
        onGetValue.seed = [
          {
            name: 'replaceRe',
            re: code.seed_r,
            text: code.seed_rp
          }
        ];
      }
    }
    if (code.peer) {
      torrentSelector.peer = code.peer;
      if (code.peer_r) {
        onGetValue.peer = [
          {
            name: 'replaceRe',
            re: code.peer_r,
            text: code.peer_rp
          }
        ];
      }
    }
    if (code.date) {
      torrentSelector.date = code.date;
      if (code.date_attr) {
        torrentSelector.date = {selector: torrentSelector.date, attr: code.date_attr};
      }
      const dateFuncList = [];
      if (code.t_r) {
        dateFuncList.push({
          name: 'replaceRe',
          re: code.t_r,
          text: code.t_r_r
        });
      }
      if (code.t_t_r) {
        dateFuncList.push('replaceToday');
      }
      if (code.t_m_r) {
        dateFuncList.push('replaceMonth');
      }
      if (code.t_f !== undefined && code.t_f !== "-1") {
        dateFuncList.push({name: 'timeFormat', format: code.t_f});
      }
      if (dateFuncList.length) {
        onGetValue.date = dateFuncList;
      }
    }

    return obj;
  },
  prepareCustomTracker: function (code) {
    const _this = this;
    let trackerObj = null;

    if (code.version === 1) {
      code = this.convertV1ToV2(code);
    }

    if (code.version === 2) {
      trackerObj = code;

      let id = '';
      const params = location.hash.substr(1).split('&');
      params.some(function (item) {
        const keyValue = item.split('=');
        if (keyValue[0] === 'id') {
          id = keyValue[1];
          return true;
        }
      });
      trackerObj.id = id || 'noTrackerId';

      trackerObj.search = trackerObj.search || {};

      ['onBeforeRequest', 'onAfterRequest', 'onBeforeDomParse', 'onAfterDomParse', 'onGetListItem'].forEach(function (key) {
        trackerObj.search[key] = _this.listToFunction(key, trackerObj.search[key]);
      });

      ['onSelectorIsNotFound', 'onEmptySelectorValue', 'onGetValue'].forEach(function (sectionName) {
        const section = trackerObj.search[sectionName];
        for (let key in section) {
          section[key] = _this.listToFunction(sectionName, section[key]);
        }
      });
    }

    return code;
  },
  prepareTracker: function (tracker) {
    const itemList = ['onGetValue', 'onSelectorIsNotFound', 'onEmptySelectorValue'];
    for (let i = 0, item; item = itemList[i]; i++) {
      if (!tracker.search[item]) {
        tracker.search[item] = {};
      }
    }

    if (!tracker.search.requestType) {
      tracker.search.requestType = 'GET';
    } else {
      tracker.search.requestType = tracker.search.requestType.toUpperCase();
    }
    if (tracker.search.rootUrl && !exKit.prepareTrackerR.hasEndSlash.test(tracker.search.rootUrl)) {
      tracker.search.rootUrl = tracker.search.rootUrl + '/';
    }
    if (tracker.search.baseUrl && !exKit.prepareTrackerR.hasEndSlash.test(tracker.search.baseUrl)) {
      tracker.search.baseUrl = tracker.search.baseUrl + '/';
    }
    return tracker;
  },
  parseHtml: function (html, location) {
    return API_getDoc(html, location);
  },
  intList: ['categoryId', 'size', 'seed', 'peer', 'date'],
  isUrlList: ['categoryUrl', 'url', 'downloadUrl', 'nextPageUrl'],
  urlCheck: function (details, tracker, value) {
    return API_normalizeUrl(details.responseUrl, value);
  },
  matchSelector: function (result, details) {
    const _this = this;
    const key = details.key;
    let item = details.item;
    const $dom = details.$dom;
    const tracker = details.tracker;
    const search = tracker.search;
    const error = {};

    if (typeof item === 'string') {
      item = {selector: item};
    }

    let node = $dom.find(item.selector).get(0);

    if (!node && search.onSelectorIsNotFound[key]) {
      node = search.onSelectorIsNotFound[key](details);
    }

    if (item.childNodeIndex !== undefined && node) {
      let childNodeIndex = item.childNodeIndex;
      if (childNodeIndex < 0) {
        childNodeIndex = node.childNodes.length + item.childNodeIndex;
      }
      node = node.childNodes[childNodeIndex];
    }

    if (!node) {
      error[key] = node;
      error[key + '!'] = 'Selector is not found!';
      error[key + 'Selector'] = item.selector;
      return;
    }

    let value = null;
    if (item.attr) {
      value = node.getAttribute(item.attr);
    } else
    if (item.prop) {
      value = node[item.prop];
    } else if (item.html) {
      value = node.innerHTML;
    } else {
      value = node.textContent;
    }
    if (value) {
      value = $.trim(value);
    }

    if (!value && search.onEmptySelectorValue[key]) {
      value = search.onEmptySelectorValue[key](details);
    }

    if (!value && value !== 0) {
      error[key] = value;
      if (item.attr) {
        error[key + '!'] = 'Attribute is not found!';
      } else
      if (item.prop) {
        error[key + '!'] = 'Property is not found!';
      } else if (item.html) {
        error[key + '!'] = 'Html content is empty!';
      } else {
        error[key + '!'] = 'Text content is empty!';
      }
      return;
    }

    if (search.onGetValue[key]) {
      value = search.onGetValue[key](details, value);
    }

    if (exKit.intList.indexOf(key) !== -1) {
      let intValue = parseInt(value);
      if (isNaN(intValue)) {
        intValue = -1;
        error[key] = value;
        error[key + '!'] = 'isNaN';
      }
      value = intValue;
    } else {
      if (exKit.isUrlList.indexOf(key) !== -1) {
        value = exKit.urlCheck(details, tracker, value);
      }
    }

    result[key] = value;
  },
  matchTorrentSelector: function (trObj, details) {
    const _this = this;
    const key = details.key;
    let item = details.item;
    const $node = details.$node;
    const tracker = details.tracker;
    const search = tracker.search;

    if (typeof item === 'string') {
      item = {selector: item};
    }

    let node = trObj.cache[item.selector];
    if (!node) {
      node = trObj.cache[item.selector] = $node.find(item.selector).get(0);
    }

    if (!node && search.onSelectorIsNotFound[key]) {
      node = search.onSelectorIsNotFound[key](details);
    }

    if (item.childNodeIndex !== undefined && node) {
      let childNodeIndex = item.childNodeIndex;
      if (childNodeIndex < 0) {
        childNodeIndex = node.childNodes.length + item.childNodeIndex;
      }
      node = node.childNodes[childNodeIndex];
    }

    if (!node) {
      trObj.error[key] = node;
      trObj.error[key + '!'] = 'Selector is not found!';
      trObj.error[key + 'Selector'] = item.selector;
      return;
    }

    let value = null;
    if (item.attr) {
      value = node.getAttribute(item.attr);
    } else
    if (item.prop) {
      value = node[item.prop];
    } else if (item.html) {
      value = node.innerHTML;
    } else {
      value = node.textContent;
    }
    if (value) {
      value = $.trim(value.replace(/\r?\n/g, ' '));
    }

    if (!value && search.onEmptySelectorValue[key]) {
      value = search.onEmptySelectorValue[key](details);
    }

    if (!value && value !== 0) {
      trObj.error[key] = value;
      if (item.attr) {
        trObj.error[key + '!'] = 'Attribute is not found!';
      } else
      if (item.prop) {
        trObj.error[key + '!'] = 'Property is not found!';
      } else if (item.html) {
        trObj.error[key + '!'] = 'Html content is empty!';
      } else {
        trObj.error[key + '!'] = 'Text content is empty!';
      }
      return;
    }

    if (search.onGetValue[key]) {
      value = search.onGetValue[key](details, value);
    }

    if (exKit.intList.indexOf(key) !== -1) {
      let intValue = parseInt(value);
      if (isNaN(intValue)) {
        intValue = -1;
        trObj.error[key] = value;
        trObj.error[key + '!'] = 'isNaN';
      }
      value = intValue;
    } else {
      if (exKit.isUrlList.indexOf(key) !== -1) {
        value = exKit.urlCheck(details, tracker, value);
      }
    }

    trObj.column[key] = value;

    return value;
  },
  isEmptyObject: function (obj) {
    for (let item in obj) {
      return false;
    }
    return true;
  },
  matchTorrentItem: function ($node, details) {
    const _this = this;
    details.$node = $node;

    const tracker = details.tracker;
    const search = tracker.search;

    if (search.onGetListItem) {
      search.onGetListItem(details);
    }

    const trObj = Object.create({cache: {}});
    trObj.column = {};
    trObj.error = {};

    for (let key in search.torrentSelector) {
      const selDetails = Object.create(details);

      selDetails.item = search.torrentSelector[key];
      selDetails.key = key;

      _this.matchTorrentSelector(trObj, selDetails);
    }

    if (!trObj.column.title || !trObj.column.url) {
      console.debug('[' + tracker.id + ']', 'Skip torrent:', trObj);
      return;
    }

    if (!trObj.column.categoryId && trObj.column.categoryId !== 0) {
      trObj.column.categoryId = -1;
    }

    if (!trObj.column.date) {
      trObj.column.date = -1;
    }

    if (!_this.isEmptyObject(trObj.error)) {
      console.debug('[' + tracker.id + ']', 'Torrent has problems:', trObj);
    }

    return trObj.column;
  },
  parseDom: function (details) {
    const _this = this;
    const tracker = details.tracker;
    const search = tracker.search;

    if (search.onBeforeDomParse) {
      search.onBeforeDomParse(details);
    }

    if (details.result) {
      return details.result;
    }

    const dom = exKit.parseHtml(details.data, details.responseUrl);
    const $dom = details.$dom = $(dom);

    if (search.onAfterDomParse) {
      search.onAfterDomParse(details);
      if (details.result) {
        return details.result;
      }
    }

    if (search.loginFormSelector && $dom.find(search.loginFormSelector).length) {
      return {requireAuth: 1};
    }

    const torrentElList = $dom.find(search.listItemSelector);

    if (search.listItemSplice) {
      if (search.listItemSplice[0] !== 0) {
        torrentElList.splice(0, search.listItemSplice[0]);
      }
      if (search.listItemSplice[1] !== 0) {
        torrentElList.splice(search.listItemSplice[1]);
      }
    }

    const resultObj = {};

    const torrentList = resultObj.torrentList = [];

    let item;
    for (let i = 0, len = torrentElList.length; i < len; i++) {
      item = _this.matchTorrentItem(torrentElList.eq(i), Object.create(details));
      item && torrentList.push(item);
    }

    if (search.nextPageSelector) {
      const selDetails = Object.create(details);

      selDetails.item = search.nextPageSelector;
      selDetails.key = 'nextPageUrl';

      _this.matchSelector(resultObj, selDetails);
    }

    return resultObj;
  },
  search: function (tracker, _details) {
    const _this = this;

    const query = _details.query;

    const details = {
      tracker: tracker,
      query: query
    };

    if (tracker.search.onBeforeRequest) {
      tracker.search.onBeforeRequest(details);
    } else {
      details.query = encodeURIComponent(details.query);
    }

    const requestOptions = {};

    let headers = [];
    if (tracker.search.requestHeaders) {
      headers = JSON.parse(tracker.search.requestHeaders);
    }

    if (tracker.search.requestMimeType) {
      const m = /charset=([^;]+)/.exec(tracker.search.requestMimeType);
      if (m) {
        requestOptions.charset = m[1];
      }
    }

    if (!_details.url) {
      Object.assign(requestOptions, {
        method: tracker.search.requestType,
        url: tracker.search.searchUrl.replace('%search%', details.query),
        body: (tracker.search.requestData || '').replace('%search%', details.query),
        headers: headers,
      });
    } else {
      Object.assign(requestOptions, {
        method: 'GET',
        url: _details.url
      });
    }

    if (requestOptions.method === 'GET' && requestOptions.body) {
      if (/\?/.test(requestOptions.url)) {
        requestOptions.url += '&' + requestOptions.body;
      } else {
        requestOptions.url += '?' + requestOptions.body;
      }
      delete requestOptions.body;
    }

    if (!requestOptions.headers) {
      requestOptions.headers = {};
    }

    if (requestOptions.body) {
      if (Array.isArray(requestOptions)) {
        const found = requestOptions.some(([key, value]) => {
          if (key === 'Content-Type') {
            return true;
          }
        });
        if (!found) {
          requestOptions.push(['Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8']);
        }
      } else {
        if (!requestOptions.headers['Content-Type']) {
          requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
      }
    }

    return API_request(requestOptions).then(function (response) {
      details.data = response.body;
      details.responseUrl = response.url;
      details.requestUrl = requestOptions.url;
    }).then(function () {
      if (tracker.search.onAfterRequest) {
        tracker.search.onAfterRequest(details);
        if (details.result) {
          return details.result;
        }
      }

      return _this.parseDom(details);
    }).then(function (result) {
      if (result.requireAuth) {
        result.requireAuth = tracker.search.loginUrl;
      }

      return result;
    });
  },
  getTrackerIconUrl: function (icon) {
    icon = icon || '#ccc';
    if (icon[0] !== '#') {
      return icon;
    }
    let svg = 'data:image/svg+xml;base64,';
    let data = '';
    if (icon === '#skull') {
      data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 48 48" version="1.1" viewBox="0 0 48 48" height="20px" width="20px"><g><g><path d="M33,46c-0.553,0-1-0.447-1-1V34h1c4.963,0,9-4.037,9-9v-5c0-9.925-8.075-18-18-18S6,10.075,6,20v5c0,4.963,4.037,9,9,9h1     v11c0,0.553-0.447,1-1,1s-1-0.447-1-1v-9.045C8.401,35.448,4,30.729,4,25v-5C4,8.972,12.972,0,24,0s20,8.972,20,20v5     c0,5.729-4.401,10.448-10,10.955V45C34,45.553,33.553,46,33,46z"/></g><g><path d="M21,46c-0.553,0-1-0.447-1-1V35c0-0.553,0.447-1,1-1s1,0.447,1,1v10C22,45.553,21.553,46,21,46z"/></g><g><path d="M27,46c-0.553,0-1-0.447-1-1V35c0-0.553,0.447-1,1-1s1,0.447,1,1v10C28,45.553,27.553,46,27,46z"/></g><g><path d="M33,32c-3.859,0-7-3.141-7-7s3.141-7,7-7s7,3.141,7,7S36.859,32,33,32z M33,20c-2.757,0-5,2.243-5,5s2.243,5,5,5     s5-2.243,5-5S35.757,20,33,20z"/></g><g><path d="M15,32c-3.859,0-7-3.141-7-7s3.141-7,7-7s7,3.141,7,7S18.859,32,15,32z M15,20c-2.757,0-5,2.243-5,5s2.243,5,5,5     s5-2.243,5-5S17.757,20,15,20z"/></g><g><path d="M5.236,18c-0.553,0-1-0.447-1-1s0.447-1,1-1C7.955,16,12,14.136,12,9c0-0.553,0.447-1,1-1s1,0.447,1,1     C14,14.908,9.592,18,5.236,18z"/></g><g><path d="M42.764,18C38.408,18,34,14.908,34,9c0-0.553,0.447-1,1-1s1,0.447,1,1c0,5.136,4.045,7,6.764,7c0.553,0,1,0.447,1,1     S43.316,18,42.764,18z"/></g><g><path d="M25.02,32c-0.005,0.001-0.012,0.001-0.02,0h-2c-0.347,0-0.668-0.18-0.851-0.475s-0.199-0.663-0.044-0.973l1-2     c0.34-0.678,1.449-0.678,1.789,0l0.92,1.84c0.129,0.168,0.205,0.379,0.205,0.607C26.02,31.553,25.572,32,25.02,32z"/></g></g></svg>';
    } else {
      data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 48 48" version="1.1" viewBox="0 0 48 48" height="20px" width="20px"><circle cx="24" cy="24" r="20" stroke="black" fill="' + icon + '" /></svg>';
    }
    svg += btoa(data);
    return svg;
  }
};
exKit.funcList.dateFormat = exKit.legacy.dateFormat.bind(exKit.legacy);
exKit.funcList.monthReplace = exKit.legacy.monthReplace.bind(exKit.legacy);
exKit.funcList.sizeFormat = exKit.legacy.sizeFormat.bind(exKit.legacy);
exKit.funcList.todayReplace = exKit.legacy.todayReplace.bind(exKit.legacy);

window.exKit = exKit;

window.API_exKit = function (trackerObj) {
  const tracker = exKit.prepareCustomTracker(trackerObj);
  exKit.prepareTracker(tracker);

  const search = function (query, nextPageUrl) {
    return exKit.search(tracker, {
      query: query,
      url: nextPageUrl
    }).then(function (result) {
      let response;
      if (result.requireAuth) {
        response = {
          success: false,
          error: 'AUTH',
          message: 'requireAuth',
          url: result.requireAuth
        };
      } else {
        response = {
          success: true,
          results: result.torrentList,
          nextPageRequest: result.nextPageUrl && {
            event: 'getNextPage',
            url: result.nextPageUrl,
            query: query
          }
        };
      }
      return response;
    });
  };

  API_event('getNextPage', function (request) {
    return search(request.query, request.url);
  });

  API_event('search', function (request) {
    return search(request.query);
  });
};

export default exKit;