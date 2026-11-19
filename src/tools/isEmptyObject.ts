const isEmptyObject = (obj: object) => {
  for (const _key in obj) {
    return false;
  }
  return true;
};

export default isEmptyObject;
