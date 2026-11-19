import {inspectPage, predictInspectedPage} from './parser-model';
import type {SearchEvidence} from './search-template';

interface ModelMetadata {
  version: number;
  parameters: number;
  features: string[];
  fields: string[];
  layers: {
    inputs: number;
    outputs: number;
    weightOffset: number;
    biasOffset: number;
    activation: string;
  }[];
}

export function createMlp(metadata: ModelMetadata, buffer: ArrayBuffer) {
  const weights = new Float32Array(buffer);
  if (metadata.version !== 1 || weights.length !== metadata.parameters) {
    throw new Error('Invalid MLP weights');
  }
  const features = new Map(metadata.features.map((feature, index) => [feature, index]));
  const fields = new Map(metadata.fields.map((field, index) => [field, index]));

  function forward(indices: number[]) {
    let previous = new Float64Array();
    for (const [index, layer] of metadata.layers.entries()) {
      const output = new Float64Array(layer.outputs);
      for (let row = 0; row < layer.outputs; row++) {
        const offset = layer.weightOffset + row * layer.inputs;
        let sum = weights[layer.biasOffset + row];
        if (index === 0) {
          for (const column of indices) sum += weights[offset + column];
        } else {
          for (let column = 0; column < layer.inputs; column++) {
            sum += previous[column] * weights[offset + column];
          }
        }
        output[row] = layer.activation === 'relu' ? Math.max(0, sum) : sum;
      }
      previous = output;
    }
    return previous;
  }
  const absence = forward([]);
  function scores(candidateFeatures: string[]) {
    const indices = candidateFeatures.flatMap((feature) => {
      const index = features.get(feature);
      return index === undefined ? [] : [index];
    });
    return forward(indices).map((score, index) => score - absence[index]);
  }
  function predict(html: string, url: string, status = 200, evidence: SearchEvidence = {}) {
    const inspected = inspectPage(html, url, status, evidence);
    return predictInspectedPage(inspected, url, rank);
  }
  function rank<T extends {features: string[]}>(field: string, candidates: T[]) {
    const fieldIndex = fields.get(field);
    if (fieldIndex === undefined) throw new Error('Unknown model field');
    return candidates
      .map((candidate) => {
        return {...candidate, score: scores(candidate.features)[fieldIndex]};
      })
      .sort((left, right) => right.score - left.score);
  }
  return {predict, rank};
}
