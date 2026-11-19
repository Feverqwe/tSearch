export function getExplorerPoster(source: string): string {
  const url = URL.parse(source);
  if (!url || (url.protocol !== 'https:' && url.protocol !== 'http:')) return source;

  const {hostname, pathname} = url;
  if (hostname === 'www.kinopoisk.ru' || hostname === 'kinopoisk.ru') {
    const id = /^\/images\/(?:sm_)?film\/(\d+)\.jpg$/.exec(pathname)?.[1];
    if (id) url.pathname = `/images/film_iphone/iphone360_${id}.jpg`;
  } else if (hostname === 'avatars.mds.yandex.net' || hostname.endsWith('.svc.cdn.yandex.net')) {
    const thumbnail = /^\/get-kinopoisk-image\/[^/]+\/[^/]+\/(\d+)(?:x\d+)?$/.exec(pathname);
    if (thumbnail && Number(thumbnail[1]) < 300) {
      url.pathname = pathname.replace(/[^/]+$/, '300x450');
    }
  } else if (hostname === 'm.media-amazon.com' && pathname.startsWith('/images/M/')) {
    const thumbnail = /\._V1_QL\d+_U([XY])(\d+)(?:_CR[\d,]+)?_\.jpg$/.exec(pathname);
    if (thumbnail && Number(thumbnail[2]) < (thumbnail[1] === 'X' ? 300 : 450)) {
      url.pathname = pathname.slice(0, thumbnail.index) + '._V1_QL75_UY450_.jpg';
    }
  } else if (hostname === 'media.themoviedb.org' || hostname === 'image.tmdb.org') {
    url.pathname = pathname.replace(/^\/t\/p\/w220_and_h330_face\//, '/t/p/w440_and_h660_face/');
  }
  return url.pathname === pathname ? source : url.href;
}
