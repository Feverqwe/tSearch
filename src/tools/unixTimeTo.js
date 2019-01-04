import moment from "moment";

moment.locale([chrome.i18n.getUILanguage(), ...navigator.languages]);

const unixTimeToString = function (unixtime) {
  return unixtime <= 0 ? '∞' : moment(unixtime * 1000).format('lll');
};

const unixTimeToFromNow = function (unixtime) {
  return unixtime <= 0 ? '∞' : moment(unixtime * 1000).fromNow();
};

export {
  unixTimeToString,
  unixTimeToFromNow
};