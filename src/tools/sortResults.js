const typeSortMap = {
  title: {
    reverse: true
  }
};

const sortResults = (results, sorts) => {
  const sortFns = sorts.map(({by, direction}) => {
    const info = typeSortMap[by];
    return (aa, bb) => {
      let a = aa[by];
      let b = bb[by];
      if (info && info.reverse) {
        [a, b] = [b, a];
      }
      if (direction === 1) {
        [a, b] = [b, a];
      }
      return a === b ? 0 : a > b ? -1 : 1;
    };
  });
  const sortFnsLen = sortFns.length;
  results.sort((a, b) => {
    let result = 0;
    for (let i = 0; i < sortFnsLen; i++) {
      if ((result = sortFns[i](a, b)) !== 0) {
        break;
      }
    }
    return result;
  });
  return results;
};

export default sortResults;
export {typeSortMap};