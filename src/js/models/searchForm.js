import {StatusCodeError, AbortError} from '../tools/errors';
import escapeRegExp from 'lodash.escaperegexp';
import {types, isAlive, getRoot} from "mobx-state-tree";
import promisifyApi from "../tools/promisifyApi";

const popsicle = require('popsicle');
const debug = require('debug')('searchForm');

/**
 * @typedef {{}} SearchFormM
 * Model:
 * @property {string} query
 * @property {string[]} suggestions
 * Actions:
 * @property {function(string)} setQuery
 * @property {function(string[])} setSuggestions
 * Views:
 * @property {function} getSuggestions
 * @property {function(string)} fetchSuggestions
 * @property {function({value:string})} handleFetchSuggestions
 * @property {function} handleClearSuggestions
 */


const searchFormModel = types.model('searchFormModel', {
  query: types.optional(types.string, ''),
  suggestions: types.optional(types.array(types.string), []),
}).actions(/**SearchFormM*/self => ({
  setQuery(value) {
    self.query = value;
  },
  setSuggestions(results) {
    self.suggestions = results;
  }
})).views(/**SearchFormM*/self => {
  let lastFetch = null;

  const fetchGoogleSuggestions = value => {
    let aborted = false;

    const request = popsicle.get({
      url: 'http://suggestqueries.google.com/complete/search',
      query: {
        client: 'firefox',
        q: value
      }
    });

    const promise = request.then(response => {
      if (!/^2/.test('' + response.status)) {
        throw new StatusCodeError(response.status, response.body, null, response);
      }

      if (aborted) {
        throw new AbortError('fetchGoogleSuggestions aborted');
      }

      return JSON.parse(response.body)[1];
    });
    promise.abort = () => {
      aborted = true;
      request.abort();
    };
    return promise;
  };

  const fetchHistorySuggestions = value => {
    let aborted = false;
    let promise = null;
    const history = getRoot(self).history;
    if (history) {
      promise = history.readyPromise.then(() => {
        return history.getHistory();
      });
    } else {
      promise = promisifyApi('chrome.storage.local.get')({
        history: {}
      }).then(({history}) => {
        return Array.from(Object.values(history));
      });
    }
    promise = promise.then(history => {
      history.sort(({count: a}, {count: b}) => {
        return a === b ? 0 : a < b ? 1 : -1;
      });

      let suggestions = history.map(item => item.query).filter(query => query.length);

      if (value) {
        const queryRe = new RegExp('^' + escapeRegExp(value), 'i');
        suggestions = suggestions.filter(value => queryRe.test(value));
      }

      if (aborted) {
        throw new AbortError('fetchHistorySuggestions aborted');
      }

      return suggestions;
    });
    promise.abort = () => {
      aborted = true;
    };
    return promise;
  };

  const fetchAbort = () => {
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
      fetchAbort();
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
        if (err.code === 'EABORT') return;
        debug('fetchSuggestions error', err);
      });
    },
    handleFetchSuggestions({value}) {
      self.fetchSuggestions(value);
    },
    handleClearSuggestions() {
      fetchAbort();
      self.setSuggestions([]);
    }
  };
});

export default searchFormModel;