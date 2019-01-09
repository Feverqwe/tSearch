/**
 * @typedef {{}} CodeV2
 * @property {number} version
 * @property {string} type
 * @property {number} uid
 * @property {string} title
 * @property {string} icon
 * @property {string} desc
 * @property {string} updateUrl
 * @property {string} downloadUrl
 * @property {string} tVersion
 * @property {CodeV2Search} search
 */

/**
 * @typedef {{}} CodeV2Search
 * @property {string} [loginUrl]
 * @property {string} [loginFormSelector]
 * @property {string} searchUrl
 * @property {string} nextPageSelector
 * @property {string} [baseUrl]
 * @property {string} [requestType]
 * @property {string} [requestData]
 * @property {string} [requestMimeType]
 * @property {{name,type}[]} [onBeforeRequest]
 * @property {{}} listItemSelector
 * @property {[number, number]} [listItemSplice]
 * @property {{}} torrentSelector
 * @property {string|{selector,attr}} [torrentSelector.categoryTitle]
 * @property {{selector,attr}} [torrentSelector.categoryUrl]
 * @property {string} [torrentSelector.title]
 * @property {{selector,attr}} [torrentSelector.url]
 * @property {string|{selector,attr}} [torrentSelector.size]
 * @property {{selector,attr}} [torrentSelector.downloadUrl]
 * @property {string} [torrentSelector.seed]
 * @property {string} [torrentSelector.peer]
 * @property {string|{selector,attr}} [torrentSelector.date]
 * @property {{}} onGetValue
 * @property {{name,re,text}[]} [onGetValue.categoryTitle]
 * @property {{name,re,text}[]} [onGetValue.categoryUrl]
 * @property {{name,re,text}[]} [onGetValue.title]
 * @property {{name,re,text}[]} [onGetValue.url]
 * @property {{name,re,text}[]} [onGetValue.size]
 * @property {{name,re,text}[]} [onGetValue.downloadUrl]
 * @property {{name,re,text}[]} [onGetValue.seed]
 * @property {{name,re,text}[]} [onGetValue.peer]
 * @property {{name,re,text}[]|string[]|{name,format}[]} [onGetValue.date]
 */

const convertCodeV1toV2 = code => {
  const codeV2 = {};
  codeV2.version = 2;
  codeV2.type = 'kit';
  codeV2.uid = code.uid;
  codeV2.icon = code.icon;
  codeV2.title = code.name;
  codeV2.desc = code.about;
  const search = codeV2.search = {};
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

  return codeV2;
};

export default convertCodeV1toV2;