import getLogger from './getLogger';

const logger = getLogger('errors');

const errorTracker = {
  trackError(error: unknown, context?: string) {
    logger.error(context || 'Error', error);
  },
  bindExceptions() {
    globalThis.addEventListener('error', (event) => this.trackError(event.error));
    globalThis.addEventListener('unhandledrejection', (event) => this.trackError(event.reason));
  },
};

export default errorTracker;
