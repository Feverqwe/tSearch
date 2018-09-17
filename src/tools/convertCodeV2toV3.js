const convertSelector = (selector, postProcess) => {
  const result = {
    selector: null,
    pipeline: [],
  };

  if (!Array.isArray(postProcess)) {
    postProcess = [];
  }

  if (typeof selector === 'string') {
    selector = {selector};
  }

  result.selector = selector.selector;

  if (typeof selector.childNodeIndex === 'number') {
    result.pipeline.push({
      name: 'getChild',
      args: [selector.childNodeIndex]
    });
  }

  if (selector.attr) {
    result.pipeline.push({
      name: 'getAttr',
      args: [selector.attr]
    });
  } else
  if (selector.prop) {
    result.pipeline.push({
      name: 'getProp',
      args: [selector.prop]
    });
  } else
  if (selector.html) {
    result.pipeline.push({
      name: 'getHtml'
    });
  } else {
    result.pipeline.push({
      name: 'getText'
    });
  }

  postProcess.forEach(item => {
    if (item === 'convertSize') {
      result.pipeline.push({
        name: 'legacySizeFormat',
      });
    } else
    if (item === 'replaceToday') {
      result.pipeline.push({
        name: 'legacyReplaceToday',
      });
    } else
    if (item === 'replaceMonth') {
      result.pipeline.push({
        name: 'legacyReplaceMonth',
      });
    } else
    if (item.name === 'replaceRe') {
      result.pipeline.push({
        name: 'replace',
        args: [item.re, item.text]
      });
    } else
    if (item.name === 'timeFormat') {
      result.pipeline.push({
        name: 'legacyParseDate',
        args: [item.format],
      });
    }
  });

  return result;
};

const convertCodeV2toV3 = /**CodeV2*/code => {
  const /**CodeStore*/codeV4 = {};

  codeV4.version = 3;


  const search = codeV4.search = {};

  search.url = code.search.searchUrl;

  const method = code.search.requestType;
  if (method) {
    search.method = method.toUpperCase();
  }

  const data = code.search.requestData;
  if (data) {
    if (search.method === 'POST') {
      search.body = data;
    } else {
      search.query = data;
    }
  }

  const onBeforeRequest = code.search.onBeforeRequest;
  if (Array.isArray(onBeforeRequest)) {
    onBeforeRequest.some(item => {
      if (item.name === 'encode') {
        if (item.type === 'cp1251') {
          search.encoding = item.type;
          return true;
        }
      }
    });
  }

  const baseUrl = code.search.baseUrl;
  if (baseUrl) {
    search.baseUrl = baseUrl;
  }

  const overrideMimeType = code.search.requestMimeType;
  if (overrideMimeType) {
    const m = /charset=([^;]+)/.exec(code.search.requestMimeType);
    if (m) {
      code.search.charset = m[1];
    }
  }


  const auth = codeV4.auth = {};

  const loginUrl = code.search.loginUrl;
  if (loginUrl) {
    auth.url = loginUrl;
  }

  const loginFormSelector = code.search.loginFormSelector;
  if (loginFormSelector) {
    auth.selector = {selector: loginFormSelector};
  }


  const selectors = codeV4.selectors = {};

  selectors.row = convertSelector(code.search.listItemSelector);

  if (codeV4.search.listItemSplice) {
    selectors.skipFromStart = code.search.listItemSplice[0];
    selectors.skipFromEnd = code.search.listItemSplice[1] * -1;
  }

  selectors.categoryTitle = convertSelector(code.search.torrentSelector.categoryTitle, code.search.onGetValue.categoryTitle);
  selectors.categoryLink = convertSelector(code.search.torrentSelector.categoryUrl, code.search.onGetValue.categoryUrl);
  selectors.title = convertSelector(code.search.torrentSelector.title, code.search.onGetValue.title);
  selectors.link = convertSelector(code.search.torrentSelector.url, code.search.onGetValue.url);
  selectors.size = convertSelector(code.search.torrentSelector.size, code.search.onGetValue.size);
  selectors.downloadLink = convertSelector(code.search.torrentSelector.downloadUrl, code.search.onGetValue.downloadUrl);
  selectors.seeds = convertSelector(code.search.torrentSelector.seed, code.search.onGetValue.seed);
  selectors.peers = convertSelector(code.search.torrentSelector.peer, code.search.onGetValue.peer);
  selectors.date = convertSelector(code.search.torrentSelector.date, code.search.onGetValue.date);

  selectors.nextPageLink = convertSelector(code.search.nextPageSelector);


  const description = codeV4.description = {};

  description.icon = code.icon;
  description.name = code.title;
  description.description = code.desc;
  description.downloadUrl = code.downloadUrl;
  description.version = code.tVersion;


  return code;
};

export default convertCodeV2toV3;