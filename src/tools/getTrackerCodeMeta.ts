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
  trackerURL: 'string',
  updateURL: 'string',
  downloadURL: 'string',
  supportURL: 'string',
  require: 'array',
  connect: '*array!connect',
  requestMode: 'string',
} as const;

const getTrackerCodeMeta = function (code: string) {
  const meta = getCodeMeta(code, fieldType);
  return {...meta, requestMode: readTrackerRequestMode(meta.requestMode)};
};

export default getTrackerCodeMeta;
