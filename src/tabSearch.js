import {fetch} from 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import {StatusCodeError} from "./tools/errors";
import arrayBufferToBase64 from "./tools/arrayBufferToBase64";

const serializeError = require('serialize-error');

!window.tabSearch && (() => {
  const idController = new Map();

  const safeResponse = () => {
    return [
      (result) => ({result}),
      (err) => ({error: serializeError(err)})
    ];
  };

  window.tabSearch = (id, url, fetchOptions) => {
    return Promise.resolve().then(() => {
      const controller = new AbortController();

      const request = fetch(url, {
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        body: fetchOptions.body,
        signal: controller.signal
      });

      idController.set(id, controller);

      return request.then(response => {
        if (!response.ok) {
          throw new StatusCodeError(response.status, null, null, response);
        }

        const {headers, ...safeResponse} = response;
        safeResponse.headers = Array.from(headers.entries());

        return response.arrayBuffer().then(arrayBuffer => {
          return {response: safeResponse, base64: arrayBufferToBase64(arrayBuffer)};
        });
      });
    }).then(...safeResponse()).then((result) => {
      chrome.runtime.sendMessage({
        id: id,
        action: 'searchResponse',
        result,
      });
    });
  };

  window.tabSearchAbort = (id) => {
    return Promise.resolve().then(() => {
      const controller = idController.get(id);
      if (controller) {
        controller.abort();
      }
    });
  };
})();