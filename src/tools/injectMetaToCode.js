const injectMetaToCode = (code, meta) => {
  let headers = [];
  Object.entries(meta).forEach(([key, value]) => {
    headers.push([key, value]);
  });

  const m = /\n(\s*\/\/\s*[=]+\/UserScript[=]+)/.exec(code);
  if (m) {
    const pos = code.indexOf(m[1]);
    if (pos !== -1) {
      code = code.substr(0, pos) + headers.map(entrie => '\/\/ @' + entrie.join(' ')).join('\n') + '\n' + code.substr(pos);
    }
  }
  return code;
};

export default injectMetaToCode;