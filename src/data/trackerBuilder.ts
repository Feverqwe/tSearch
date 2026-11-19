import {draftExtraction, parseCodeDraft, type CodeDraft} from './codeDraft.ts';
import type {TrackerInference} from '../tools/trackerInference/index.ts';

type Detection = Extract<TrackerInference, {status: 'results'}>;

export function applyTrackerInference(code: CodeDraft, prediction: TrackerInference): CodeDraft {
  if (prediction.status === 'login-required') {
    return {
      ...code,
      auth: {
        url: code.auth.url || prediction.login.url,
        loginForm: code.auth.loginForm?.selector ? code.auth.loginForm : prediction.login.loginForm,
      },
    };
  }
  if (prediction.status !== 'results') return code;

  const inferred = parseCodeDraft(JSON.stringify(prediction.definition));
  const {skipFromStart, skipFromEnd, ...rules} = inferred.selectors;
  const selectors = {
    ...code.selectors,
    ...rules,
    skipFromStart: prediction.definition.selectors.skipFromStart ?? code.selectors.skipFromStart,
    skipFromEnd: prediction.definition.selectors.skipFromEnd ?? code.selectors.skipFromEnd,
  };
  return {
    ...code,
    selectors,
    search:
      prediction.searchSource === 'unknown'
        ? {...code.search, url: code.search.url || inferred.search.url}
        : {
            ...code.search,
            ...prediction.definition.search,
            method: inferred.search.method,
            query: inferred.search.query,
            body: inferred.search.body,
            encoding: prediction.definition.search.encoding ?? code.search.encoding,
          },
    description: {
      ...code.description,
      name: code.description.name || inferred.description.name,
      url: code.description.url || inferred.description.url,
      description: code.description.description || inferred.description.description,
    },
    auth: {...code.auth, url: code.auth.url || inferred.auth.url},
  };
}

export function extractionKey(code: CodeDraft, phrase: string) {
  const draft = draftExtraction(code);
  delete draft.search.baseUrl;
  return JSON.stringify([draft, code.description.requestMode, phrase]);
}

export interface TrackerDetectionReport {
  prediction: Detection;
  applied: CodeDraft;
}

export function createBuilderOperation() {
  let current: AbortController | undefined;
  function cancel() {
    current?.abort();
    current = undefined;
  }
  return {
    start() {
      cancel();
      const controller = new AbortController();
      current = controller;
      return {
        signal: controller.signal,
        isCurrent: () => current === controller,
        finish() {
          if (current === controller) current = undefined;
        },
      };
    },
    cancel,
  };
}
