const exKitGetDoc = (html: string, location: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const base = doc.head.querySelector('base');
  if (!base) {
    const base = doc.createElement('base');
    base.href = location;
    doc.head.appendChild(base);
  }

  return doc;
};

export default exKitGetDoc;
