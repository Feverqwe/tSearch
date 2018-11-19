const getArgvValue = key => {
  let result = null;
  process.argv.some((arg, index) => {
    if (arg === key) {
      result = process.argv[index + 1];
      return true;
    }
  });
  return result;
};

module.exports = getArgvValue;