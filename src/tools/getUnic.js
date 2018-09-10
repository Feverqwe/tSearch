const getUnic = array => {
  return array.filter((item, index) => {
    return array.indexOf(item) === index;
  });
};

export default getUnic;