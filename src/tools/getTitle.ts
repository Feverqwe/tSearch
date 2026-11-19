const getTitle = (title?: string | null) => {
  const parts = ['TMS'];
  if (title) {
    parts.unshift(title);
  }
  return parts.join(' :: ');
};

export default getTitle;
