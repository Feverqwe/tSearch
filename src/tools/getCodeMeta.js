import getLogger from "./getLogger";
import compareVersion from 'compare-versions';

const debug = getLogger('getCodeMeta');

const processVersion = value => {
  compareVersion(value, value);
  return value;
};

const processConnect = value => {
  value = value.filter(function (pattern) {
    return !!pattern;
  });
  if (!value.length) {
    throw new Error("Connect field is empty!");
  }
  return value;
};

const processAction = value => {
  value = value.map(function (action) {
    const json = JSON.parse(action);
    if (!json.title || !json.command) {
      throw new Error('Action is incorrect');
    }
    return json;
  });
  if (!value.length) {
    throw new Error("Action field is empty!");
  }
  return value;
};

const processLocale = (localeObj, meta) => {
  const result = {};
  Object.keys(localeObj).forEach(key => {
    const json = localeObj[key];
    try {
      result[key] = JSON.parse(json);
    } catch (err) {
      debug(`Parse locale  ${key}: ${json} error: ${err.message}`);
    }
  });
  if (!meta.defaultLocale) {
    meta.defaultLocale = 'en';
  }
  if (!result[meta.defaultLocale]) {
    throw new Error(`Default locale ${meta.defaultLocale} is not found!`);
  }
  return result;
};

const getCodeMeta = (code, fieldScheme) => {
  const meta = {};

  const keyType = {};
  const importantKeys = [];
  const keyValidators = {};
  Object.keys(fieldScheme).forEach(key => {
    const value = fieldScheme[key];
    const m = /^(\*)?([^!]+)(?:!(.+))?$/.exec(value);
    const isImportant = m[1];
    const type = m[2];
    const typeValidators = !m[3] ? [] : m[3].split('!');

    const validators = typeValidators.map(type => {
      switch (type) {
        case 'version':
          return processVersion;
        case 'connect':
          return processConnect;
        case 'action':
          return processAction;
        case 'locale':
          return processLocale;
        default:
          throw new Error(`Validator is not found ${type}`);
      }
    });

    keyType[key] = type;
    if (isImportant) {
      importantKeys.push(key);
    }
    if (validators.length) {
      keyValidators[key] = validators;
    }
  });

  let readMeta = false;
  code.split(/\r?\n/).some(function (line) {
    if (/^\s*\/\//.test(line)) {
      if (!readMeta && /[=]+UserScript[=]+/.test(line)) {
        readMeta = true;
      }
      if (readMeta && /[=]+\/UserScript[=]+/.test(line)) {
        readMeta = false;
        return true;
      }
      if (readMeta) {
        const m = /^\s*\/\/\s*@([A-Za-z0-9]+)\s+(.+)$/.exec(line);
        if (m) {
          const key = m[1];
          const value = m[2].trim();
          const type = keyType[key];
          switch (type) {
            case 'string':
              meta[key] = value;
              break;
            case 'array':
              if (!meta[key]) {
                meta[key] = [];
              }
              meta[key].push(value);
              break;
            case 'object':
              if (!meta[key]) {
                meta[key] = {};
              }
              const m = /^([^\s]+)\s+(.+)$/.exec(value);
              if (!m) {
                throw new Error(`Parse field ${key}: ${meta[key]} error!`);
              }
              const _key = m[1];
              const _value = m[2].trim();
              Object.assign(meta[key], {[_key]: _value});
              break;
            default: {
              debug(`Skip meta key ${key}: ${value}`);
            }
          }
        }
      }
    }
  });

  importantKeys.forEach(key => {
    if (!meta[key]) {
      throw new Error(`Field ${key} is important!`);
    }
  });

  Object.keys(keyValidators).forEach(key => {
    if (meta[key]) {
      const validators = keyValidators[key];
      validators.forEach(validator => {
        try {
          meta[key] = validator(meta[key], meta);
        } catch (err) {
          throw new Error(`Validate field ${key}: ${meta[key]} error: ${err.message}`);
        }
      });
    }
  });

  return meta;
};

export default getCodeMeta;