import moment from 'moment';

moment.locale([chrome.i18n.getUILanguage(), ...navigator.languages]);

const unixTimeToString = function (unixtime: number | null | undefined) {
  const date = moment(Number(unixtime) * 1000);
  return unixtime && unixtime > 0 && date.isValid() ? date.format('lll') : '—';
};

const unixTimeToFromNow = function (unixtime: number | null | undefined) {
  const date = moment(Number(unixtime) * 1000);
  return unixtime && unixtime > 0 && date.isValid() ? date.fromNow() : '—';
};

export {unixTimeToString, unixTimeToFromNow};
