const colorToIcon = (color) => {
  if (!/^#/.test(color)) {
    return color;
  }
  const icon = btoa(`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="${color}" /></svg>`);
  return `data:image/svg+xml;base64,${icon}`;
};

export default colorToIcon;