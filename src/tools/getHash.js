const getHash = string => {
  const len = string.length;
  let result = 0;
  let index = 0;
  if ( len > 0 ) {
    while (index < len) {
      result = (result << 5) - result + string.charCodeAt(index++) | 0;
    }
  }
  return '' + result;
};

export default getHash;