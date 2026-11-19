import ModuleWorker from './moduleWorker';

export interface NextPage {
  url: string;
}

export interface TrackerItem {
  title: string;
  url: string;
  categoryTitle?: string | null;
  categoryUrl?: string | null;
  size?: number | string | null;
  downloadUrl?: string | null;
  seeds?: number | string | null;
  peers?: number | string | null;
  date?: number | string | null;
}

export interface TrackerResult {
  success: boolean;
  results: TrackerItem[];
  nextPageRequest: NextPage | null;
}

export default class TrackerWorker extends ModuleWorker {
  async search(query: string): Promise<TrackerResult> {
    await this.init();
    return this.callFn('events.search', [{query}]);
  }

  async searchNext(next: NextPage): Promise<TrackerResult> {
    await this.init();
    return this.callFn('events.getNextPage', [next]);
  }
}
