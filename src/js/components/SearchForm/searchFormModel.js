import {AbortError, StatusCodeError} from '../../tools/errors';
import {types, isAlive, destroy} from "mobx-state-tree";
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import 'whatwg-fetch'
import historyModel from "../../models/historyModel";
import getLogger from "../../tools/getLogger";

const qs = require('querystring');
const escapeStringRegexp = require('escape-string-regexp');

const debug = getLogger('searchFormModel');

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
  },
  destroy() {
    destroy(self);
  },
})).views(/**SearchFormM*/self => {
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
    const promise = historyModel.readyPromise.then(() => {
      return historyModel.getHistorySortByCount();
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
    handleFetchSuggestions({value}) {
      self.fetchSuggestions(value);
    },
    handleClearSuggestions() {
      abortFetch();
      self.setSuggestions([]);
    }
  };
});

export default searchFormModel;