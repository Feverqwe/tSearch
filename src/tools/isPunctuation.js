const isPunctuation = function (char) {
  if (typeof char !== 'string') {
    return true;
  }
  const code = char.charCodeAt(0);
  if (code < 31) {
    return false;
  }
  if (code > 31 && code < 48) {
    return true;
  }
  if (code > 57 && code < 65) {
    return true;
  }
  if (code > 90 && code < 97) {
    return true;
  }
  if (code > 122 && code < 127) {
    return true;
  }
  if ([171, 174, 169, 187, 8222, 8221, 8220].indexOf(code) !== -1) {
    return true;
  }
  return false;
};

export default isPunctuation;