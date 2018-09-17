import moment from "moment";
import {
  sizeFormat,
  monthReplace,
  todayReplace,
  dateFormat
} from '../tools/exKitLegacyFn';

const filesizeParser = require('filesize-parser');

const exKitMethods = {
  getAttr: (element, attr) => {
    return element.getAttribute(attr);
  },
  getProp: (element, prop) => {
    return element[prop];
  },
  getText: (element) => {
    return element.textContent;
  },
  getHtml: (element) => {
    return element.innerHTML;
  },
  getChild: (element, index) => {
    return element.childNodes[index];
  },
  replace: (string, pattern, replaceTo) => {
    return string.replace(new RegExp(pattern, 'ig'), replaceTo);
  },
  parseDate: (string, formats) => {
    return moment(string, formats).unix();
  },
  parseSize: (string) => {
    return filesizeParser(string);
  },
  toInt: (string) => {
    return parseInt(string, 10);
  },
  toFloat: (string) => {
    return parseFloat(string);
  },

  legacyReplaceToday: todayReplace,
  legacyReplaceMonth: monthReplace,
  legacyParseDate: dateFormat,
  legacySizeFormat: sizeFormat
};

export default exKitMethods;