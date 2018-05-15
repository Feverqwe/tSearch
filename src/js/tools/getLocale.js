const getLocale = (defaultLocale, locales) => {
  const languages = [];
  const uiLang = chrome.i18n.getUILanguage();
  const m = /([^-]+)/.exec(uiLang);
  if (m) {
    languages.push(m[1]);
  }
  languages.push(defaultLocale);

  let result = null;
  if (locales) {
    languages.some(language => {
      return result = locales[language];
    });

    if (result) {
      result = Object.assign({}, locales[defaultLocale], result);
    }
  }

  return result;
};

export default getLocale;