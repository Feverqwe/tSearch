const jsonToUserscript = json => {
  const code = [];
  const meta = [];
  meta.unshift('==UserScript==');
  meta.push(['@name', json.title].join(' '));
  if (json.desc) {
    meta.push(['@description', json.desc].join(' '));
  }
  if (json.icon) {
    meta.push(['@icon', json.icon].join(' '));
  }
  if (json.downloadUrl) {
    meta.push(['@downloadURL', json.downloadUrl].join(' '));
  }
  const hostname = /\/\/([^\/]+)/.exec(json.search.searchUrl);
  if (hostname) {
    meta.push(['@connect', '*://'+hostname[1]+'/*'].join(' '));
  }
  if (json.search.baseUrl) {
    meta.push(['@trackerURL', json.search.baseUrl].join(' '));
  }
  if (json.tVersion) {
    meta.push(['@version', json.tVersion].join(' '));
  } else {
    meta.push(['@version', '1.0'].join(' '));
  }
  meta.push(['@require', 'exKit'].join(' '));
  meta.push('==/UserScript==');
  code.push.apply(code, meta.map(function (line) {
    return ['//', line].join(' ');
  }));
  code.push('');
  code.push('var code = ' + JSON.stringify(json, null, 2) + ';');
  code.push('');
  code.push('API_exKit(code);');
  return code.join('\n');
};

export default jsonToUserscript;