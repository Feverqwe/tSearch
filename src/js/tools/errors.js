class StatusCodeError extends Error {
  constructor(statusCode, body, options, response) {
    const message = statusCode + ' - ' + JSON.stringify(body);
    super(message);

    this.name = 'StatusCodeError';
    this.statusCode = statusCode;
    this.options = options;
    this.response = response;
  }
}

class AbortError extends Error {
  constructor(message) {
    super(message);

    this.name = 'AbortError';
    this.code = 'EABORT';
  }
}

export {StatusCodeError, AbortError};