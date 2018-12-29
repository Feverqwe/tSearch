import getLogger from "./getLogger";
import tracker from "./tracker";

const path = require('path');

const logger = getLogger('errorTrackerUi');

class ErrorTracker {
  constructor() {
    this.renameMap = [];
    this.errors = [];
  }

  /**
   * @param {Error} err
   * @param {string} [prefix]
   */
  trackError = (err, prefix) => {
    const errors = this.errors;
    try {
      const _prefix = prefix ? prefix + ': ' : '';
      const exd = this._stripDesc(_prefix + this._renameStack(this._getErrorStack(err))).substr(0, 500);
      if (errors.indexOf(exd) === -1) {
        errors.unshift(exd);
        errors.splice(10);

        this.track({
          exd: exd,
          t: 'exception'
        });
      }
    } catch (err) {
      logger.error('trackError error', err);
    }
  };

  /**
   * @param {ErrorEvent} errorEvent
   */
  _handleUncaughtException = (errorEvent) => {
    this.trackError(errorEvent.error, 'UncaughtException');
  };

  /**
   * @param {PromiseRejectionEvent} promiseRejectionEvent
   */
  _handleUnhandledRejection = (promiseRejectionEvent) => {
    this.trackError(promiseRejectionEvent.reason, 'UnhandledRejection');
  };

  bindExceptions() {
    window.addEventListener('error', this._handleUncaughtException);
    window.addEventListener('unhandledrejection', this._handleUnhandledRejection);
  }

  unbindExceptions() {
    window.removeEventListener('error', this._handleUncaughtException);
    window.removeEventListener('unhandledrejection', this._handleUnhandledRejection);
  }

  /**
   * @param {Object} params
   */
  track(params) {
    if (BUILD_ENV.mode !== 'development') {
      tracker.track(params);
    } else {
      logger.debug('Skip track error', params);
    }
  }

  updateRenameMap() {
    return Array.from(document.querySelectorAll('script:not([data-rename-matched])')).map(script => {
      script.dataset.renameMatched = 'true';
      const srcReStr = this._escapeRegExp(script.src);
      this.renameMap.push([new RegExp(srcReStr, 'g'), path.basename(script.src)]);
    });
  }

  /**
   * @param {Error} err
   * @return {string}
   */
  _getErrorStack(err) {
    const stack = !err ? 'UNKNOWN' : err.stack || `${err.name}: ${err.message}`;
    return '' + stack;
  }

  /**
   * @param {string} str
   * @return {string}
   */
  _stripDesc(str) {
    return ('' + str).replace(/\r/g, '').replace(/[\s\t]+/g, ' ').replace(/\n+/g, '\n');
  }

  /**
   * @param {string} str
   * @return {string}
   */
  _escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }

  /**
   * @param {string} str
   * @return {string}
   */
  _renameStack(str) {
    this.updateRenameMap();
    this.renameMap.forEach(([nameRe, newName]) => {
      str = str.replace(nameRe, newName);
    });
    return str;
  }
}

const errorTracker = new ErrorTracker();

export default errorTracker;