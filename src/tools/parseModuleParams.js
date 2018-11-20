const qs = require('querystring');

const parseModuleParams = (params) => {
  if (/^{.+}$/.test(params)) {
    return JSON.parse(params);
  }
  return qs.parse(params);
};

export default parseModuleParams;