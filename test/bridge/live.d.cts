export function connectLiveBridge(file?: string): {
  fetch(
    input: string | URL | Request,
    init?: RequestInit & {requestContext?: 'extension' | 'tab'},
  ): Promise<Response>;
  restart(): Promise<void>;
};

export function startLiveBridge(
  temporaryDir: string,
  transport: (request: unknown) => Promise<unknown>,
  file?: string,
  options?: {restart?: () => Promise<void>},
): Promise<() => Promise<void>>;
