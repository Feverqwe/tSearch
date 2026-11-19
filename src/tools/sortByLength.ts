const sortByLength = ({length: a}: {length: number}, {length: b}: {length: number}) => {
  return a === b ? 0 : a > b ? -1 : 1;
};

export default sortByLength;
