import {
  type SearchEvidence,
  assertPortableRules,
  inferPageDetails,
  inspectPageDetails,
  pageElementPath,
} from '../../../packages/tracker-toolkit/src/index';
import ExKitTracker from '../../sandbox/exKitTracker';
import type {TrackerResponse} from '../exKitRequest';

import {createMlp} from './runtime';

import metadata from './model.json';
import pageMetadata from './page-model.json';

let model:
  Promise<{rows: ReturnType<typeof createMlp>; pages: ReturnType<typeof createMlp>}> | undefined;
function loadModel() {
  async function weights(url: URL) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Model could not be loaded');
    return response.arrayBuffer();
  }
  return (model ??= Promise.all([
    weights(new URL('./weights.bin', import.meta.url)),
    weights(new URL('./page-weights.bin', import.meta.url)),
  ])
    .then(([rows, pages]) => {
      return {rows: createMlp(metadata, rows), pages: createMlp(pageMetadata, pages)};
    })
    .catch((error) => {
      model = undefined;
      throw error;
    }));
}

export async function inferTracker(response: TrackerResponse, evidence: SearchEvidence = {}) {
  const parser = await loadModel();
  const rowPrediction = parser.rows.predict(
    response.body,
    response.url,
    response.statusCode,
    evidence,
  );
  if (rowPrediction.status !== 'results') return rowPrediction;
  const doc = new DOMParser().parseFromString(response.body, 'text/html');
  const base = doc.createElement('base');
  base.href = response.url;
  doc.head.prepend(base);
  const details = inferPageDetails(
    inspectPageDetails(doc, new URL(response.url), pageElementPath),
    new URL(response.url),
    parser.pages.rank,
  );
  const prediction = {
    ...rowPrediction,
    definition: {
      ...rowPrediction.definition,
      description: details.description,
      auth: details.auth,
      selectors: {
        ...rowPrediction.definition.selectors,
        ...(details.nextPage ? {nextPageUrl: details.nextPage} : {}),
      },
    },
  };
  assertPortableRules(prediction.definition.selectors);
  const tracker = new ExKitTracker();
  await tracker.init(prediction.definition);
  const {results, nextPageUrl} = tracker.parseResponse(
    {tracker, response, event: 'search', request: null},
    response,
  );
  if (!results.length || results.length !== prediction.rowCount)
    throw new Error('Generated tracker did not parse all result rows');
  return {...prediction, nextPageUrl, observedNextPageUrl: details.observedNextPageUrl};
}

export type TrackerInference = Awaited<ReturnType<typeof inferTracker>>;
