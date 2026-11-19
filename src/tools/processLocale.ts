const processLocale = (value: string, locale?: Record<string, string> | null) => {
  const setLocale = (value: string) => {
    const key = value.substr(6, value.length - 6 - 2);
    return (locale && locale[key]) || value;
  };

  const readMsg = (value: string) => {
    const startMsg = 6;
    let endMsg = value.indexOf('__', startMsg);
    if (endMsg !== -1) {
      endMsg += 2;
    }
    let pos = null;
    let str = null;
    if (endMsg !== -1) {
      const msg = value.substr(0, endMsg);
      if (/^__MSG_[a-zA-Z_]+__$/.test(msg)) {
        str = setLocale(msg);
        pos = endMsg - 1;
      } else {
        str = value.substr(0, startMsg);
        pos = startMsg - 1;
      }
    } else {
      str = value;
      pos = value.length - 1;
    }
    return {
      text: str,
      i: pos,
    };
  };

  let str = '';
  for (let i = 0, symbol; (symbol = value[i]); i++) {
    if (value.substr(i, 6) === '__MSG_') {
      const result = readMsg(value.substr(i));
      i += result.i;
      str += result.text;
    } else {
      str += symbol;
    }
  }
  return str;
};

export default processLocale;
