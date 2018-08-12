const jsonToUserscript = json => {
  const meta = [];
  meta.push('==UserScript==');
  meta.push(`@name ${json.title}`);
  if (json.desc) {
    meta.push(`@description ${json.desc}`);
  }
  if (json.icon) {
    meta.push(`@icon ${json.icon}`);
  }
  if (json.downloadUrl) {
    meta.push(`@downloadURL ${json.downloadUrl}`);
  }
  const hostname = /\/\/([^\/]+)/.exec(json.search.searchUrl);
  if (hostname) {
    meta.push(`@connect *://${hostname[1]}`);
  }
  if (json.search.baseUrl) {
    meta.push(`@trackerURL ${json.search.baseUrl}`);
  }
  if (json.tVersion) {
    meta.push(`@version ${json.tVersion}`);
  } else {
    meta.push(`@version 1.0`);
  }
  meta.push('@require exKit');
  meta.push('==/UserScript==');

  const code = [];
  code.push(...meta.map(line => `// ${line}`));
  code.push('');
  code.push(`var code = ${JSON.stringify(json, null, 2)};`);
  code.push('');
  code.push('API_exKit(code);');
  return code.join('\n');
};

export default jsonToUserscript;