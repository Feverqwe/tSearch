import getCodeMeta from './getCodeMeta.ts';
import {readTrackerRequestMode} from './tabProxy.ts';

const fieldType = {
  name: '*string',
  version: '*string!version',
  author: 'string',
  description: 'string',
  homepageURL: 'string',
  icon: 'string',
  icon64: 'string',
  siteURL: 'string',
  updateURL: 'string',
  downloadURL: 'string',
  supportURL: 'string',
  cacheTTL: 'number',
  requestMode: 'string',
  require: 'array',
  connect: '*array!connect',
  action: 'array!action',
  locale: 'object!locale',
  defaultLocale: 'string',
} as const;

const getExploreModuleCodeMeta = function (code: string) {
  const {action, locale, ...meta} = getCodeMeta(code, fieldType);
  return {
    ...meta,
    actions: action,
    locales: locale,
    requestMode: readTrackerRequestMode(meta.requestMode),
  };
};

export default getExploreModuleCodeMeta;
