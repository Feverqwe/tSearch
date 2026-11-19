import qs from 'querystring-es3';

const parseModuleParams = (params: string): Record<string, unknown> => {
  if (/^{.+}$/.test(params)) {
    return JSON.parse(params);
  }
  return qs.parse(params);
};

export default parseModuleParams;
