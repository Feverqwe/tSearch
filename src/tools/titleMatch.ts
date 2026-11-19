import {type TitleQuery, titleMatchFeatures} from './titleMatchFeatures.ts';

import model from './titleMatchWeights.json' with {type: 'json'};

export interface TitleMatchScore {
  score: number;
  tier: number;
  coverage: number;
  orderedCoverage: number;
  compactness: number;
}

export function evaluateTitleMatch(query: TitleQuery, title: string): TitleMatchScore {
  if (!query.words.length) {
    return {score: 0, tier: 3, coverage: 0, orderedCoverage: 0, compactness: 0};
  }
  const {values, tier} = titleMatchFeatures(query, title);
  const logit = values.reduce(
    (sum, feature, index) => sum + feature * model.weights[index],
    model.bias,
  );
  return {
    score: 1 / (1 + Math.exp(-logit)),
    tier,
    coverage: values[0],
    orderedCoverage: values[1],
    compactness: values[3],
  };
}
