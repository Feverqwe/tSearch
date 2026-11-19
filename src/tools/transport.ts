import {deserializeError, serializeError} from 'serialize-error';

interface Port {
  onMessage: (listener: (message: unknown) => void) => void;
  postMessage: (message: object) => void;
}

interface PendingCall {
  resolve: (result: unknown) => void;
  reject: (reason: unknown) => void;
}

export default class Transport {
  private readonly pending = new Map<number, PendingCall>();
  private readonly port: Port;
  private readonly actions: object;
  private nextId = 0;
  private closed = false;

  constructor(port: Port, actions: object) {
    this.port = port;
    this.actions = actions;
    port.onMessage((message) => this.receive(message));
  }

  callFn<T = unknown>(fn: string, args: unknown[] = []): Promise<T> {
    return new Promise<unknown>((resolve, reject) => {
      if (this.closed) throw new Error('Module connection is closed');
      const callbackId = ++this.nextId;
      this.pending.set(callbackId, {resolve, reject});
      try {
        this.port.postMessage({callbackId, fn, args});
      } catch (error) {
        this.pending.delete(callbackId);
        reject(error);
      }
    }) as Promise<T>;
  }

  destroy() {
    this.closed = true;
    for (const {reject} of this.pending.values()) {
      reject(new Error('Module connection is closed'));
    }
    this.pending.clear();
  }

  private receive(value: unknown) {
    if (this.closed || !value || typeof value !== 'object') return;
    const message = value as Record<string, unknown>;
    if (typeof message.responseId === 'number') {
      const call = this.pending.get(message.responseId);
      if (!call) return;
      this.pending.delete(message.responseId);
      if ('error' in message) call.reject(deserializeError(message.error));
      else call.resolve(message.result);
      return;
    }

    const {callbackId, fn, args} = message;
    if (typeof callbackId === 'number' && typeof fn === 'string' && Array.isArray(args)) {
      void this.respond(callbackId, fn, args);
    }
  }

  private async respond(responseId: number, path: string, args: unknown[]) {
    try {
      const result: unknown = await this.invoke(path, args);
      if (!this.closed) this.port.postMessage({responseId, result});
    } catch (error) {
      if (!this.closed) this.port.postMessage({responseId, error: serializeError(error)});
    }
  }

  private invoke(path: string, args: unknown[]): unknown {
    const parts = path.split('.');
    const name = parts.pop()!;
    let scope: unknown = this.actions;
    for (const part of parts) {
      scope = readOwnProperty(scope, part);
    }
    const action = readOwnProperty(scope, name);
    if (typeof action !== 'function') throw new Error(`Unknown module action: ${path}`);
    return Reflect.apply(action, scope, args);
  }
}

function readOwnProperty(object: unknown, name: string) {
  if (!object || typeof object !== 'object' || !Object.hasOwn(object, name)) {
    throw new Error(`Unknown module action: ${name}`);
  }
  return (object as Record<string, unknown>)[name];
}
