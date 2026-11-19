export class StatusCodeError extends Error {
  readonly statusCode: number;
  readonly options: RequestInit | null;
  readonly response: Response;

  constructor(statusCode: number, body: unknown, options: RequestInit | null, response: Response) {
    super(`${statusCode} - ${JSON.stringify(body)}`);
    this.name = 'StatusCodeError';
    this.statusCode = statusCode;
    this.options = options;
    this.response = response;
  }
}

export class AbortError extends Error {
  readonly code = 'EABORT';

  constructor(message: string) {
    super(message);
    this.name = 'AbortError';
  }
}

export class ErrorWithCode extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}
