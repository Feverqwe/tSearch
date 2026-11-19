import type {ModuleSource} from '../tools/moduleWorker';
import Transport from '../tools/transport';

import BaseApi from './baseApi';

type ModuleTask = () => unknown;

const scope = window as Window & {
  API_async?: (callback: ModuleTask) => Promise<unknown>;
};

const api = {
  info: null as unknown,
  events: Object.create(null),
  async init(source: ModuleSource, requires: string[], info: unknown) {
    api.info = info;

    const tasks: Promise<unknown>[] = [];
    scope.API_async = (callback) => {
      const task = Promise.resolve().then(callback);
      tasks.push(task);
      return task;
    };

    if ('definition' in source || requires.includes('exKit')) {
      const {exKit, API_exKit} = await import('./exKit');
      Object.assign(window, {exKit, API_exKit});
      if ('definition' in source) API_exKit(source.definition);
    }

    if ('path' in source) await loadPackagedModule(source.path);
    if ('script' in source) {
      // Only source approved in the local editor reaches this opaque-origin frame.
      new Function(source.script)();
    }
    await Promise.all(tasks);
    if ('script' in source && typeof api.events.search !== 'function') {
      throw new Error('Tracker script did not register a search handler');
    }
  },
};

function loadPackagedModule(path: string) {
  return new Promise<void>((resolve, reject) => {
    if (!/^(trackers|explorerModules)\/[a-zA-Z0-9_-]+\.js$/.test(path)) {
      throw new Error('Invalid packaged module path');
    }
    const script = document.createElement('script');
    script.src = path;
    script.addEventListener('load', () => resolve(), {once: true});
    script.addEventListener('error', () => reject(new Error(`Could not load ${path}`)), {
      once: true,
    });
    document.head.append(script);
  });
}

const transport = new Transport(
  {
    postMessage: (message) => parent.postMessage(message, location.origin),
    onMessage: (listener) => {
      window.addEventListener('message', (event: MessageEvent<unknown>) => {
        if (event.source === parent && event.origin === location.origin) listener(event.data);
      });
    },
  },
  api,
);

Object.assign(window, new BaseApi(api, transport).public);
