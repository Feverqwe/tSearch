import exKitGetDoc from '../tools/exKitGetDoc';
import exKitNormalizeUrl from '../tools/exKitNormalizeUrl';
import type {TrackerResponse} from '../tools/exKitRequest';
import exKitRequestOptionsNormalize, {
  type RawRequestOptions,
} from '../tools/exKitRequestOptionsNormalize';
import {getExplorerPoster} from '../tools/explorerPoster';
import type Transport from '../tools/transport';

type ModuleCallback = (...args: unknown[]) => unknown;

interface ModuleApi {
  info: unknown;
  events: Record<string, ModuleCallback>;
}

export default class BaseApi {
  constructor(
    private readonly api: ModuleApi,
    private readonly transport: Transport,
  ) {}

  readonly public = {
    API_normalizeUrl: exKitNormalizeUrl,
    API_getDoc: exKitGetDoc,
    API_getExplorerPoster: getExplorerPoster,
    API_event: (name: string, callback: ModuleCallback) => {
      this.api.events[name] = (...args) => Promise.resolve().then(() => callback(...args));
    },
    API_getInfo: () => this.api.info,
    API_request: async (raw: string | RawRequestOptions) => {
      const {options, toJson} = exKitRequestOptionsNormalize(raw);
      const response = await this.transport.callFn<TrackerResponse>('request', [options]);
      return toJson ? {...response, body: JSON.parse(response.body) as unknown} : response;
    },
  };
}
