import {getParentOfType, isAlive, types} from 'mobx-state-tree';
import {AbortError, StatusCodeError} from "../tools/errors";
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import {fetch} from 'whatwg-fetch'
import getLogger from "../tools/getLogger";
import RootStore from "./RootStore";

const qs = require('querystring');
const escapeStringRegexp = require('escape-string-regexp');

const debug = getLogger('searchFormStore');


/**
 * @typedef {{}} SearchForm
 * @property {string} [query]
 * @property {string[]} suggestions
 * @property {function} setQuery
 * @property {function} setSuggestions
 * @property {function} getSuggestions
 * @property {function} fetchSuggestions
 * @property {function} clearSuggestions
 */
const SearchForm = types.model('SearchForm', {
  query: types.optional(types.string, ''),
  suggestions: types.array(types.string),
}).actions(self => ({
  setQuery(value) {
    self.query = value;
  },
  setSuggestions(results) {
    self.suggestions = results;
  },
})).views(self => {
  let lastFetch = null;


  const fetchGoogleSuggestions = value => {
    const controller = new AbortController();

    const promise = fetch('http://suggestqueries.google.com/complete/search?' + qs.stringify({
      client: 'firefox',
      q: value
    }), {
      signal: controller.signal
    }).then(response => {
      if(response.ok) {
        return response.json();
      } else {
        throw new StatusCodeError(response.status, null, null, response);
      }
    }).then(body => {
      return body[1];
    });

    promise.abort = () => {
      controller.abort();
    };

    return promise;
  };

  const fetchHistorySuggestions = value => {
    let aborted = false;
    const promise = Promise.resolve().then(() => {
      const /**@type RootStore*/rootStore = getParentOfType(self, RootStore);
      const history = rootStore.history;
      if (history.state !== 'done') {
        return [];
      } else {
        return history.getHistorySortByCount();
      }
    }).then(history => {
      if (aborted) {
        throw new AbortError('fetchHistorySuggestions aborted');
      }

      let suggestions = history.map(item => item.query).filter(query => query.length);

      if (value) {
        const queryRe = new RegExp('^' + escapeStringRegexp(value), 'i');
        suggestions = suggestions.filter(value => queryRe.test(value));
      }

      return suggestions;
    });
    promise.abort = () => {
      aborted = true;
    };
    return promise;
  };

  const abortFetch = () => {
    if (lastFetch) {
      lastFetch.abort();
      lastFetch = null;
    }
  };

  return {
    getSuggestions() {
      return self.suggestions.slice(0);
    },
    fetchSuggestions(value) {
      abortFetch();
      if (!value) {
        lastFetch = fetchHistorySuggestions();
      } else {
        lastFetch = fetchGoogleSuggestions(value);
      }
      lastFetch.then(results => {
        if (isAlive(self)) {
          self.setSuggestions(results);
        } else {
          debug('setSuggestions skip, dead', results);
        }
      }, err => {
        if (err.name === 'AbortError') return;
        debug('fetchSuggestions error', err);
      });
    },
    clearSuggestions() {
      abortFetch();
      self.setSuggestions([]);
    }
  };
});

export default SearchForm;