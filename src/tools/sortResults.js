const typeSortMap = {
  title: {
    reverse: true
  }
};

const sortResults = (results, sortByList) => {
  const sortFnList = sortByList.map(({by, direction}) => {
    const info = typeSortMap[by];
    return ({[by]: a}, {[by]: b}) => {
      if (info && info.reverse) {
        [a, b] = [b, a];
      }
      if (direction === 1) {
        [a, b] = [b, a];
      }
      return a === b ? 0 : a > b ? -1 : 1;
    };
  });
  results.sort((a, b) => {
    let result = 0;
    sortFnList.some(fn => {
      return (result = fn(a, b)) !== 0;
    });
    return result;
  });
  return results;
};

export default sortResults;
export {typeSortMap};