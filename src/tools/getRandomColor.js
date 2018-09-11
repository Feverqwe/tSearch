const getRandomColor = () => {
  return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
};

export default getRandomColor;