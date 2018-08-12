const sortByLength = ({length: a}, {length: b}) => {
  return a === b ? 0 : a > b ? -1 : 1;
};

export default sortByLength;