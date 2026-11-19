import assert from 'node:assert/strict';
import {test} from 'node:test';
import {getExplorerPoster} from '../explorerPoster.ts';

test('upgrades thumbnails using the image providers’ larger renditions', () => {
  const posters = [
    [
      'https://www.kinopoisk.ru/images/film/123.jpg',
      'https://www.kinopoisk.ru/images/film_iphone/iphone360_123.jpg',
    ],
    [
      'https://www.kinopoisk.ru/images/sm_film/123.jpg',
      'https://www.kinopoisk.ru/images/film_iphone/iphone360_123.jpg',
    ],
    [
      'https://avatars.mds.yandex.net/get-kinopoisk-image/123/poster/72x108',
      'https://avatars.mds.yandex.net/get-kinopoisk-image/123/poster/300x450',
    ],
    [
      'https://m.media-amazon.com/images/M/poster@._V1_QL75_UX90_CR0,0,90,133_.jpg',
      'https://m.media-amazon.com/images/M/poster@._V1_QL75_UY450_.jpg',
    ],
    [
      'https://media.themoviedb.org/t/p/w220_and_h330_face/poster.jpg',
      'https://media.themoviedb.org/t/p/w440_and_h660_face/poster.jpg',
    ],
  ];
  for (const [thumbnail, poster] of posters) {
    assert.equal(getExplorerPoster(thumbnail), poster);
  }
});

test('preserves large posters and images from unknown hosts', () => {
  for (const source of [
    'https://avatars.mds.yandex.net/get-kinopoisk-image/123/poster/600x900',
    'https://m.media-amazon.com/images/M/poster@._V1_QL75_UX400_CR0,0,400,600_.jpg',
    'https://example.test/t/p/w220_and_h330_face/poster.jpg',
    '',
  ]) {
    assert.equal(getExplorerPoster(source), source);
  }
});
