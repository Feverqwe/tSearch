import Transport from './transport';

export default class FrameWorker {
  private readonly frame = document.createElement('iframe');
  private readonly queue: object[] = [];
  private readonly transport: Transport;
  private ready = false;

  constructor(moduleId: string, actions: object) {
    this.transport = new Transport(
      {
        onMessage: (listener) => {
          this.receive = listener;
        },
        postMessage: (message) => {
          if (this.ready) this.postMessage(message);
          else this.queue.push(message);
        },
      },
      actions,
    );

    window.addEventListener('message', this.onMessage);
    this.frame.src = `sandbox.html#${new URLSearchParams({moduleId})}`;
    this.frame.hidden = true;
    this.frame.sandbox.add('allow-scripts');
    this.frame.addEventListener(
      'load',
      () => {
        this.ready = true;
        for (const message of this.queue.splice(0)) this.postMessage(message);
      },
      {once: true},
    );
    document.body.append(this.frame);
  }

  callFn<T>(name: string, args: unknown[]): Promise<T> {
    return this.transport.callFn(name, args);
  }

  destroy() {
    window.removeEventListener('message', this.onMessage);
    this.frame.remove();
    this.queue.length = 0;
    this.transport.destroy();
  }

  private receive: (value: unknown) => void = () => {};

  private readonly onMessage = (event: MessageEvent<unknown>) => {
    if (event.origin === 'null' && event.source === this.frame.contentWindow) {
      this.receive(event.data);
    }
  };

  private postMessage(message: object) {
    this.frame.contentWindow?.postMessage(message, '*');
  }
}
