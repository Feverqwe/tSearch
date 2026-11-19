import encodeCp1251 from '../tools/encodeCp1251';
import {dateFormat, monthReplace, sizeFormat, todayReplace} from '../tools/exKitLegacyFn';

import ExKitTracker, {type KitSettings} from './exKitTracker';

interface CategoryList {
  categoryList?: Record<string, (string | number)[]>;
}

const categoryIds: Record<string, number> = {
  serials: 0,
  music: 1,
  games: 2,
  films: 3,
  cartoon: 4,
  books: 5,
  soft: 6,
  anime: 7,
  doc: 8,
  sport: 9,
  xxx: 10,
  humor: 11,
};

function idInCategoryList(tracker: CategoryList, id: string | number) {
  const category = Object.entries(tracker.categoryList ?? {}).find(([, ids]) => ids.includes(id));
  return category ? categoryIds[category[0]] : -1;
}

export const exKit = {
  funcList: {
    encodeCp1251,
    idInCategoryList,
    idInCategoryListInt(tracker: CategoryList, url: string, pattern: RegExp) {
      const match = url.match(pattern);
      return match ? idInCategoryList(tracker, Number.parseInt(match[1])) : -1;
    },
    idInCategoryListStr(tracker: CategoryList, url: string, pattern: RegExp) {
      const match = url.match(pattern);
      return match ? idInCategoryList(tracker, match[1]) : -1;
    },
    dateFormat,
    monthReplace,
    sizeFormat,
    todayReplace,
  },
};

export function API_exKit(code: KitSettings & {version?: number}) {
  return API_async(async () => {
    if (
      (code?.version !== undefined && code.version !== 3) ||
      typeof code?.search?.url !== 'string' ||
      typeof code?.selectors?.row?.selector !== 'string'
    ) {
      throw new Error('Expected an ExKit tracker with version 3 search and selectors');
    }
    const tracker = new ExKitTracker();
    await tracker.init(code);

    function searchResult({results, nextPageUrl}: ReturnType<ExKitTracker['parseResponse']>) {
      return {success: true, results, nextPageRequest: nextPageUrl ? {url: nextPageUrl} : null};
    }

    API_event('search', async (request) => {
      const session = {tracker, event: 'search', request};
      const response = await tracker.search(session, request.query);
      return searchResult(tracker.parseResponse(session, response));
    });

    API_event('getNextPage', async (request) => {
      const session = {tracker, event: 'getNextPage', request};
      const response = await tracker.searchNext(session, request.url);
      return searchResult(tracker.parseResponse(session, response));
    });
  });
}
