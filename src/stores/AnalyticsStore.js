import {flow, isAlive, types} from "mobx-state-tree";
import "whatwg-fetch";
import getLogger from "../tools/getLogger";
import {ErrorWithCode} from "../tools/errors";

const logger = getLogger('AnalyticsStore');

/**
 * @typedef {{}} AnalyticsStore
 * @property {string} [state]
 * @property {function:Promise} init
 */
const AnalyticsStore = types.model('AnalyticsStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
}).actions(self => {
  return {
    init: flow(function* () {
      if (self.state !== 'idle') return;

      self.state = 'pending';
      try {
        yield fetch('https://www.google-analytics.com/analytics.js', {
          method: 'HEAD'
        }).then((response) => {
          if (!response.ok) {
            throw new ErrorWithCode('Head is not ok', 'HEAD_ERROR');
          }

          initGa();
        });

        if (isAlive(self)) {
          self.state = 'done';
        }
      } catch (err) {
        if (err.code === 'HEAD_ERROR') {
          logger.warn('init error', err);
        } else {
          logger.error('init error', err);
        }
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
  };
});

const initGa = () => {
  window.GoogleAnalyticsObject = 'ga';
  const ga = window.ga = window.ga || function() {
    (window.ga.q = window.ga.q || []).push(arguments);
  };

  ga.l = Date.now();
  ga('create', 'UA-10717861-22', 'auto');
  ga('set', 'forceSSL', true);
  ga('set', 'checkProtocolTask', null);
  ga('set', 'appName', 'tms');
  ga('set', 'appId', 'tms-v3');
  ga('set', 'appVersion', BUILD_ENV.version);
  ga('require', 'displayfeatures');
  ga('send', 'pageview');

  const gas = document.createElement('script');
  gas.src = 'https://www.google-analytics.com/analytics.js';
  document.head.appendChild(gas);
};

export default AnalyticsStore;