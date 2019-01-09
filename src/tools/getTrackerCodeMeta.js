import getCodeMeta from "./getCodeMeta";

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
  connect: '*array!connect'
};

const getTrackerCodeMeta = function (code) {
  return getCodeMeta(code, fieldType);
};

export default getTrackerCodeMeta;