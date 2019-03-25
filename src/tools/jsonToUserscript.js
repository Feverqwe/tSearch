const stringify = require('json-stringify-pretty-compact');

const jsonToUserscript = (json) => {
  const meta = [];
  meta.push('==UserScript==');

  const uri = new URL(json.search.url);

  const description = json.description || {};

  meta.push(`@name ${description.name}`);

  if (description.description) {
    meta.push(`@description ${description.description}`);
  }

  if (description.icon) {
    meta.push(`@icon ${description.icon}`);
  }

  if (description.updateUrl) {
    meta.push(`@updateURL ${description.updateUrl}`);
  }

  if (description.downloadUrl) {
    meta.push(`@downloadURL ${description.downloadUrl}`);
  }

  if (description.url) {
    meta.push(`@trackerURL ${description.url}`);
  } else {
    meta.push(`@trackerURL ${uri.protocol}//${uri.hostname}`);
  }

  if (description.version) {
    meta.push(`@version ${json.description.version}`);
  } else {
    meta.push(`@version 1.0`);
  }

  meta.push(`@connect *://${uri.hostname}`);
  meta.push('@require exKit');
  meta.push('==/UserScript==');

  const code = [];
  code.push(...meta.map(line => `// ${line}`));
  code.push('');
  code.push(`const code = ${stringify(json)};`);
  code.push('');
  code.push('API_exKit(code);');
  return code.join('\n');
};

export default jsonToUserscript;