const typeSortMap = {
  title: {
    reverse: true
  }
};

const sortResults = (results, sorts) => {
  const sortFns = sorts.map(({by, direction}) => {
    const info = typeSortMap[by];
    const isReverse = info && info.reverse;
    return (aa, bb) => {
      const ab = [aa[by], bb[by]];
      if (isReverse) {
        ab.reverse();
      }
      if (direction === 1) {
        ab.reverse();
      }
      const [a, b] = ab;
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