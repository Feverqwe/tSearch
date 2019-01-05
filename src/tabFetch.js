import {fetch} from 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import {StatusCodeError} from "./tools/errors";
import arrayBufferToBase64 from "./tools/arrayBufferToBase64";

const serializeError = require('serialize-error');

!window.tabFetch && (() => {
  const idController = new Map();

  const serializeResult = () => {
    return [
      result => ({result}),
      err => ({error: serializeError(err)})
    ];
  };

  const isAbsoluteUrl = (url) => {
    return /^[a-z][a-z0-9+.-]*:/.test(url);
  };

  const isHttp = (protocol) => {
    return /^https?:/.test(protocol);
  };

  window.tabFetch = (id, url, fetchOptions) => {
    return Promise.resolve().then(() => {
      const controller = new AbortController();

      if (isAbsoluteUrl(url)) {
        const uri = new URL(url);
        if (uri.protocol !== location.protocol && isHttp(uri.protocol) && isHttp(location.protocol)) {
          uri.protocol = location.protocol;
          url = uri.toString();
        }
      }

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
    }).then(...serializeResult()).then((result) => {
      chrome.runtime.sendMessage({
        id: id,
        action: 'tabFetchResponse',
        result,
      });
    });
  };

  window.tabFetchAbort = (id) => {
    return Promise.resolve().then(() => {
      const controller = idController.get(id);
      if (controller) {
        controller.abort();
      }
    });
  };

  window.stop();

  const element = (document.body || document.head);
  if (element) {
    element.parentNode.textContent = '';
  }
})();