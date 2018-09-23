import {
  dateFormat as legacyParseDate,
  monthReplace as legacyReplaceMonth,
  sizeFormat as legacySizeFormat,
  todayReplace as legacyReplaceToday
} from '../tools/exKitLegacyFn';
import {API_legacyExKit} from './legacyExKit';
import ExKitTracker from "./exKitTracker";
import encodeCp1251 from "../tools/encodeCp1251";


const exKit = {
  funcList: {
    encodeCp1251: encodeCp1251,
    idInCategoryList: function (tracker, cId) {
      const mapNameId = {
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
        humor: 11
      };

      for (let key in tracker.categoryList) {
        const list = tracker.categoryList[key];
        if (list.indexOf(cId) !== -1) {
          return mapNameId[key];
        }
      }

      return -1;
    },
    idInCategoryListInt: function (tracker, url, regexp) {
      let cId = url.match(regexp);
      cId = cId && cId[1];
      if (cId === null) {
        return -1;
      }
      cId = parseInt(cId);
      return this.idInCategoryList(tracker, cId);
    },
    idInCategoryListStr: function (tracker, url, regexp) {
      let cId = url.match(regexp);
      cId = cId && cId[1];
      if (cId === null) {
        return -1;
      }
      return this.idInCategoryList(tracker, cId);
    }
  },
};
exKit.funcList.dateFormat = legacyParseDate;
exKit.funcList.monthReplace = legacyReplaceMonth;
exKit.funcList.sizeFormat = legacySizeFormat;
exKit.funcList.todayReplace = legacyReplaceToday;

const API_exKit = code => {
  if (!code.version) {
    return API_legacyExKit(code);
  }

  return API_async(() => {
    const exKitTracker = new ExKitTracker();
    return exKitTracker.init(code).then(() => {
      const onResult = result => {
        let nextPageRequest = null;
        if (result.nextPageUrl) {
          nextPageRequest = {
            url: result.nextPageUrl,
          }
        }

        return {
          success: true,
          results: result.results,
          nextPageRequest: nextPageRequest,
        };
      };

      API_event('search', request => {
        const session = {
          tracker: exKitTracker,
          event: 'search',
          request,
        };
        return exKitTracker.search(session, request.query).then(response => {
          return exKitTracker.parseResponse(session, response);
        }).then(onResult);
      });

      API_event('getNextPage', request => {
        const session = {
          tracker: exKitTracker,
          event: 'getNextPage',
          request,
        };
        return exKitTracker.searchNext(session, request.url).then(response => {
          return exKitTracker.parseResponse(session, response);
        }).then(onResult);
      });
    });
  });
};

export {exKit, API_exKit};