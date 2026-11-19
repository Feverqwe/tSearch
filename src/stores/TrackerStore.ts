import {makeAutoObservable, observableRef, runInAction} from 'mobx';

import type {TrackerRecord} from '../data/trackerRecords';
import TrackerWorker from '../tools/trackerWorker';
import getIconFromMeta from '../tools/getIconFromMeta';
import getLogger from '../tools/getLogger';

type UpdateState = 'idle' | 'pending' | 'done' | 'error';
const logger = getLogger('tracker');

export async function sendTrackerMessage(
  message:
    | {action: 'updateTracker'; id: string}
    | {action: 'downloadTracker'; id: string; updateURL?: string; downloadURL?: string},
) {
  const reply: {error?: object; result?: unknown} | undefined =
    await chrome.runtime.sendMessage(message);
  if (!reply) throw new Error('Response is empty');
  if (reply.error) throw Object.assign(new Error(), reply.error);
  return reply.result;
}

export default class TrackerStore {
  updateState: UpdateState = 'idle';
  worker: TrackerWorker | null = null;
  private consumers = 0;
  private profileOptions: {enableProxy?: boolean} = {};
  private record: TrackerRecord;

  constructor(record: TrackerRecord) {
    this.record = record;
    makeAutoObservable<this, 'record' | 'consumers' | 'profileOptions'>(
      this,
      {
        record: observableRef,
        worker: false,
        consumers: false,
        profileOptions: false,
      },
      {autoBind: true},
    );
  }

  get id() {
    return this.record.id;
  }
  get meta() {
    return this.record.meta;
  }
  get localOverride() {
    return this.record.options?.localOverride === true;
  }

  getIconUrl() {
    return getIconFromMeta(this.meta);
  }

  reconcile(record: TrackerRecord) {
    const previous = this.record;
    this.record = record;
    if (
      this.worker &&
      (previous.code !== record.code ||
        previous.options?.localOverride !== record.options?.localOverride ||
        previous.meta.requestMode !== record.meta.requestMode ||
        JSON.stringify(previous.meta.connect) !== JSON.stringify(record.meta.connect))
    ) {
      this.worker.destroy();
      this.worker = this.createWorker();
    }
  }

  setProfileOptions(options: {enableProxy?: boolean}) {
    this.profileOptions = {...options};
    this.worker?.setProfileOptions(this.profileOptions);
  }

  attach() {
    this.consumers++;
    this.worker ??= this.createWorker();
  }

  deattach() {
    this.consumers = Math.max(0, this.consumers - 1);
    queueMicrotask(() => {
      if (this.consumers === 0) this.dispose();
    });
  }

  dispose() {
    this.worker?.destroy();
    this.worker = null;
  }

  private createWorker() {
    const {id, code, meta} = this.record;
    return new TrackerWorker(
      {
        id,
        code,
        localOverride: this.localOverride,
        meta: {...meta, connect: Array.isArray(meta.connect) ? meta.connect : []},
      },
      this.profileOptions,
    );
  }

  async update() {
    this.updateState = 'pending';
    try {
      await sendTrackerMessage({action: 'updateTracker', id: this.id});
      runInAction(() => {
        this.updateState = 'done';
      });
    } catch (error) {
      const unchanged =
        error instanceof Error && 'code' in error && error.code === 'NEW_VERSION_IS_NOT_FOUND';
      if (!unchanged) logger.error('Could not update tracker', this.id, error);
      runInAction(() => {
        this.updateState = unchanged ? 'done' : 'error';
      });
    }
  }
}
