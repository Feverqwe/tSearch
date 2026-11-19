import type {Criterion} from '../tools/qualityConfig';

const categoryLabels = [
  'categorySerials',
  'categoryMusic',
  'categoryGames',
  'categoryFilms',
  'categoryCartoons',
  'categoryBooks',
  'categorySoft',
  'categoryAnime',
  'categoryDocumentary',
  'categorySport',
  'categoryXXX',
  'categoryHumor',
];

export const message = (key: string) => chrome.i18n.getMessage(key);
export const qualityCategory = (id: number) => message(categoryLabels[id] ?? 'categoryOther');
export const criterionLabel = (criterion: Criterion) => message(`quality_${criterion}`);
