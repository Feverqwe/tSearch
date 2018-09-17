import exKit from "../sandbox/exKit";

/**
 * @typedef {CodeV2} CodeV3
 * @property {number} version
 * @property {string} id
 * @property {CodeV3Search} search
 */

/**
 * @typedef {CodeV2Search} CodeV3Search
 * @property {function} onBeforeRequest
 * @property {function} onAfterRequest
 * @property {function} onBeforeDomParse
 * @property {function} onAfterDomParse
 * @property {function} onGetListItem
 * @property {function} onSelectorIsNotFound
 * @property {function} onEmptySelectorValue
 * @property {function} onGetValue
 * @property {string|{selector,attr}} nextPageSelector
 */

const listToFunction = (key, list) => {
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
    } else
    if (item.name === 'replaceRe') {
      const re = new RegExp(item.re, 'ig');
      funcList.push(function (details, value) {
        return value.replace(re, item.text);
      });
    } else
    if (item === 'replaceToday') {
      funcList.push(function (details, value) {
        return exKit.funcList.todayReplace(value);
      });
    } else
    if (item === 'replaceMonth') {
      funcList.push(function (details, value) {
        return exKit.funcList.monthReplace(value);
      });
    } else
    if (item.name === 'timeFormat') {
      funcList.push(function (details, value) {
        return exKit.funcList.dateFormat(item.format, value);
      });
    } else
    if (item === 'convertSize') {
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
};

const convertCodeV2toV3 = /**CodeV2*/code => {
  const codeV3 = Object.assign({}, code);
  codeV3.version = 3;

  let id = '';
  const params = location.hash.substr(1).split('&');
  params.some(function (item) {
    const keyValue = item.split('=');
    if (keyValue[0] === 'id') {
      id = keyValue[1];
      return true;
    }
  });
  codeV3.id = id || 'noTrackerId';

  codeV3.search = Object.assign({}, codeV3.search);

  ['onBeforeRequest', 'onAfterRequest', 'onBeforeDomParse', 'onAfterDomParse', 'onGetListItem'].forEach(function (key) {
    codeV3.search[key] = listToFunction(key, codeV3.search[key]);
  });

  ['onSelectorIsNotFound', 'onEmptySelectorValue', 'onGetValue'].forEach(function (sectionName) {
    const section = codeV3.search[sectionName];
    for (let key in section) {
      section[key] = listToFunction(sectionName, section[key]);
    }
  });

  return codeV3;
};

export default convertCodeV2toV3;