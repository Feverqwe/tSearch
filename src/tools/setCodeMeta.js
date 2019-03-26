const stripMetaFromCode = (code) => {
  let readFinish = false;
  let readMeta = false;

  return code.split(/\r?\n/).filter(function (line) {
    if (/^\s*\/\//.test(line)) {
      if (!readMeta && /[=]+UserScript[=]+/.test(line)) {
        readMeta = true;
      }
      if (readMeta && /[=]+\/UserScript[=]+/.test(line)) {
        readMeta = false;
        readFinish = true;
        return false;
      }
      if (!readFinish && readMeta) {
        return false;
      }
    }
    return true;
  }).join('\n').trim();
};

const fieldScheme = {
  require: ['array', 'string'],
  connect: ['array', 'string'],
  action: ['array', 'json'],
  locale: ['object', 'json'],
};

const fieldProcessor = {
  json(value) {
    return JSON.stringify(value);
  },
  string(value) {
    return value;
  },
};

const metaToString = (metadata) => {
  const meta = [];
  meta.push('==UserScript==');

  Object.entries(metadata).forEach(([key, value]) => {
    const scheme = fieldScheme[key] || ['string', 'string'];
    const valueType = scheme[0];
    const valueProcessor = fieldProcessor[scheme[1]];
    switch (valueType) {
      case 'string': {
        meta.push(`@${key} ${valueProcessor(value)}`);
        break;
      }
      case 'array': {
        value.forEach((value) => {
          meta.push(`@${key} ${valueProcessor(value)}`);
        });
        break;
      }
      case 'object': {
        Object.entries(value).forEach(([subKey, subValue]) => {
          meta.push(`@${key} ${subKey} ${valueProcessor(subValue)}`);
        });
        break;
      }
    }
  });

  meta.push('==/UserScript==');
  return meta.map(line => `// ${line}`).join('\n');
};

const setCodeMeta = (code, meta) => {
  return metaToString(meta) + '\n\n' + stripMetaFromCode(code);
};

export default setCodeMeta;