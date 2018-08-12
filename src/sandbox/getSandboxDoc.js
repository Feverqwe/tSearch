const replaceAttribute = (node, attr) => {
  node.setAttribute('DENY-' + attr.name, attr.value);
  node.removeAttribute(attr.name);
};

const commentNode = node => {
  if (node.parentNode) {
    const comment = document.createComment(node.outerHTML);
    node.parentNode.replaceChild(comment, node);
  }
};

const getSandboxDoc = (html, location) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const base = doc.head.querySelector('base');
  if (!base) {
    const base = doc.createElement('base');
    base.href = location;
    doc.head.appendChild(base);
  }

  Array.from(doc.querySelectorAll('*')).forEach(node => {
    Array.from(node.attributes).forEach(attr => {
      if (/^on/i.test(attr.name)) {
        replaceAttribute(node, attr);
      } else
      if (/^javascript:/.test(attr.value)) {
        replaceAttribute(node, attr);
      }
    });
  });

  Array.from(doc.querySelectorAll('script')).forEach(commentNode);

  Array.from(doc.querySelectorAll('iframe')).forEach(commentNode);

  Array.from(doc.querySelectorAll('frame')).forEach(commentNode);

  return doc;
};

export default getSandboxDoc;