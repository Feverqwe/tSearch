function createFetch(
  transport,
  {allowedOrigins, defaultContext = 'extension', defaultCredentials = 'include'} = {},
) {
  return async (input, init) => {
    const {requestContext = defaultContext, ...fetchInit} = init ?? {};
    if (requestContext !== 'extension' && requestContext !== 'tab') {
      throw new TypeError('Bridge requestContext must be "extension" or "tab"');
    }
    const request = new Request(input, {
      ...fetchInit,
      credentials:
        fetchInit.credentials ??
        (input instanceof Request ? input.credentials : defaultCredentials),
    });
    const {origin, protocol} = new URL(request.url);
    if (
      !['http:', 'https:'].includes(protocol) ||
      (allowedOrigins && !allowedOrigins.has(origin))
    ) {
      throw new TypeError('Request origin is outside the browser bridge configuration');
    }
    const body =
      request.body === null ? null : Buffer.from(await request.arrayBuffer()).toString('base64');
    const result = await transport({
      requestContext,
      url: request.url,
      init: {
        method: request.method,
        headers: [...request.headers],
        credentials: request.credentials,
        redirect: request.redirect,
        mode: request.mode,
        cache: request.cache,
      },
      body,
      timeout: 15_000,
    });
    return asResponse(result);
  };
}

function asResponse({body, status, statusText, headers, url, redirected, type}) {
  const response =
    status === 0
      ? Response.error()
      : new Response(body == null ? null : Buffer.from(body, 'base64'), {
          status,
          statusText,
          headers,
        });
  return withBrowserMetadata(response, {url, redirected, type});
}

function withBrowserMetadata(response, {url, redirected, type}) {
  const clone = response.clone.bind(response);
  return Object.defineProperties(response, {
    url: {value: url},
    redirected: {value: redirected},
    type: {value: type},
    clone: {value: () => withBrowserMetadata(clone(), {url, redirected, type})},
  });
}

module.exports = {createFetch};
