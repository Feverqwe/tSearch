const getPortSchemes = (value?: string | number) => {
  const schemes = [];
  const port = Number(value);

  if (port) {
    switch (port) {
      case 80: {
        schemes.push('http:');
        schemes.push('ws:');
        break;
      }
      case 443: {
        schemes.push('https:');
        schemes.push('wss:');
        break;
      }
      case 21: {
        schemes.push('ftp:');
        break;
      }
      case 70: {
        schemes.push('gopher:');
        break;
      }
    }
  }

  return schemes;
};

export default getPortSchemes;
