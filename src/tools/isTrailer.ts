export default function isTrailer(title: string) {
  return /Трейлер|Тизер|Teaser|Trailer/i.test(title);
}
