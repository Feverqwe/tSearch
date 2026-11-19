import type {BrowserContext} from 'playwright';

export function prepareBridgeExtension(
  parentDir: string,
  origins: readonly (string | URL)[] | null,
): Promise<{extensionDir: string; allowedOrigins: Set<string> | null}>;

export function browserTransport(
  context: BrowserContext,
): Promise<(request: unknown) => Promise<unknown>>;
