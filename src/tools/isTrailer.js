const isTrailer = function(title) {
  return /Трейлер|Тизер|Teaser|Trailer/i.test(title);
};

export default isTrailer;