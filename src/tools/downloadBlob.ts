const downloadBlob = function (blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 250);
};

export default downloadBlob;
