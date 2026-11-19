import type {KitSettings} from './exKitTracker';
import type {exKit as TrackerUtilities} from './exKit';
import type {TrackerResponse} from '../tools/exKitRequest';
import type {RawRequestOptions} from '../tools/exKitRequestOptionsNormalize';

declare global {
  type PackagedTracker = KitSettings & {
    version: 3;
    type?: 'kit';
    description?: Record<string, string>;
    categoryList?: Record<string, (number | string)[]>;
    flags?: Record<string, string | number>;
  };

  interface PackagedExplorerItem {
    title: string;
    url: string;
    poster?: string;
    titleOriginal?: string;
  }

  function API_async<T>(callback: () => T): Promise<Awaited<T>>;
  function API_exKit(code: KitSettings): Promise<void>;
  function API_getDoc(html: string, url: string): Document;
  function API_getExplorerPoster(url: string): string;
  function API_request(options: string | RawRequestOptions): Promise<TrackerResponse>;
  function API_normalizeUrl(location: string, url: string): string;
  function API_event(name: 'search', callback: (request: {query: string}) => unknown): void;
  function API_event(name: 'getNextPage', callback: (request: {url: string}) => unknown): void;
  function API_event(name: 'getItems', callback: (params: Record<string, string>) => unknown): void;
  function API_event(
    name: 'command',
    callback: (command: string, params: Record<string, string>) => unknown,
  ): void;
  const exKit: typeof TrackerUtilities;
}
