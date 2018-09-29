const getNodePath = (target, container, options = {}) => {
  const skipClassNames = options.skipClassNames || [];

  const pathParts = [];

  let parent = target;
  let element;
  while (element = parent) {
    parent = element.parentNode;

    if (!parent || parent.nodeType !== 1) {
      break;
    }

    if (element === container) {
      break;
    }

    if (element.id) {
      const selector = `#${element.id}`;
      if (container.querySelectorAll(selector).length === 1) {
        pathParts.unshift(selector);
        break;
      }
    }

    const tagName = element.tagName;
    const tagNameLow = tagName.toLowerCase();
    const classList = Array.from(element.classList).filter(name => skipClassNames.indexOf(name) === -1);

    const childNodesWithSameTagName = Array.from(parent.childNodes).filter(child => child.tagName === tagName);
    if (childNodesWithSameTagName.length === 1) {
      pathParts.unshift(tagNameLow);
    } else {
      const childNodesWithSameTagNameAndClasses = childNodesWithSameTagName.filter(child => {
        return classList.every(name => child.classList.contains(name));
      });

      if (childNodesWithSameTagNameAndClasses.length === 1) {
        const selector = `${tagNameLow}.${classList.join('.')}`;

        pathParts.unshift(selector);

        if (container.querySelectorAll(selector).length === 1) {
          break;
        }
      } else {
        const index = childNodesWithSameTagName.indexOf(element);
        pathParts.unshift(`${tagNameLow}:eq(${index})`);
      }
    }
  }

  return pathParts.join(' > ');
};

export default getNodePath;