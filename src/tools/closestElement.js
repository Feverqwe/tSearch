const closestElement = (node, selector) => {
  while (node) {
    if (node.matches(selector)) {
      return node;
    } else {
      node = node.parentElement;
    }
  }
  return null;
};

export default closestElement;