import exKitBuildConnectRe from './exKitBuildConnectRe';
import exKitRequest, {type TrackerRequestContext, type TrackerRequestOptions} from './exKitRequest';
import FrameWorker from './frameWorker';
import {parseTrackerDefinition, prepareTrackerDefinition} from './trackerDefinition';
import {
  isTrackerScript,
  prepareTrackerScript,
  readTrackerScriptApprovals,
  trackerScriptDigest,
} from './trackerScript';

import explorerModules from '../explorers.json';
import trackers from '../trackers.json';

interface ModuleSnapshot {
  id: string;
  code: string;
  localOverride?: boolean;
  meta: {
    connect: string[];
    require?: string[];
    locale?: Record<string, unknown>;
    requestMode?: TrackerRequestContext['requestMode'];
  };
}

export type ModuleSource =
  {path: string} | {definition: ReturnType<typeof parseTrackerDefinition>} | {script: string};

type TrackerScript = ReturnType<typeof prepareTrackerScript>;

export default class ModuleWorker {
  private worker: FrameWorker | null = null;
  private initPromise: Promise<unknown> | null = null;
  private readonly requestContext: TrackerRequestContext;
  private closed = false;

  static async validateScript(id: string, script: TrackerScript) {
    const worker = new ModuleWorker({id, ...script});
    try {
      await worker.startScript(script);
    } finally {
      worker.destroy();
    }
  }

  constructor(
    private readonly module: ModuleSnapshot,
    profileOptions: TrackerRequestContext['profileOptions'] = {},
  ) {
    this.requestContext = {
      connectRe: exKitBuildConnectRe(module.meta.connect),
      requestMode: module.meta.requestMode,
      profileOptions,
      requests: [],
    };
  }

  init() {
    if (!this.initPromise) this.initPromise = this.initFrame();
    return this.initPromise;
  }

  setProfileOptions(profileOptions?: TrackerRequestContext['profileOptions']) {
    this.requestContext.profileOptions = profileOptions || {};
  }

  callFn<T>(event: string, args: unknown[]): Promise<T> {
    if (!this.worker) return Promise.reject(new Error('Module connection is closed'));
    return this.worker.callFn(event, args);
  }

  abortAllRequests() {
    for (const request of this.requestContext.requests.splice(0)) request.abort();
  }

  destroy() {
    this.closed = true;
    this.worker?.destroy();
    this.worker = null;
    this.abortAllRequests();
  }

  private async initFrame() {
    const {id, code, meta, localOverride} = this.module;
    const folder =
      !localOverride && Object.hasOwn(trackers, id)
        ? 'trackers'
        : Object.hasOwn(explorerModules, id)
          ? 'explorerModules'
          : null;
    let source: ModuleSource;
    if (folder) {
      source = {path: `${folder}/${id}.js`};
    } else {
      try {
        // The historical UserScript wrapper can contain a plain JSON definition.
        source = {definition: parseTrackerDefinition(code)};
        this.requestContext.connectRe = exKitBuildConnectRe(
          prepareTrackerDefinition(code).meta.connect,
        );
      } catch (error) {
        if (!isTrackerScript(code)) throw error;
        const approvals = await readTrackerScriptApprovals();
        if (!Object.hasOwn(approvals, id) || approvals[id] !== (await trackerScriptDigest(code))) {
          throw new Error('Open the tracker editor to approve this script', {cause: error});
        }
        return this.startScript(prepareTrackerScript(code));
      }
    }
    return this.startModule(source, folder ? (meta.require ?? []) : ['exKit']);
  }

  private startScript({code, meta}: TrackerScript) {
    this.requestContext.origin = meta.connect[0];
    this.requestContext.connectRe = exKitBuildConnectRe(meta.connect);
    this.requestContext.requestMode = meta.requestMode;
    return this.startModule({script: code}, meta.require);
  }

  private async startModule(source: ModuleSource, requires: string[]) {
    if (this.closed) throw new Error('Module connection is closed');
    this.worker = new FrameWorker(this.module.id, {
      request: (options: TrackerRequestOptions) => exKitRequest(this.requestContext, options),
    });

    try {
      await this.worker.callFn('init', [
        source,
        requires,
        {
          locale: this.module.meta.locale,
        },
      ]);
    } catch (error) {
      this.destroy();
      throw error;
    }
  }
}
