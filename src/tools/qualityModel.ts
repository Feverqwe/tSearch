import {
  defaults,
  isBuiltinRegex,
  qualityCategoryIds,
  type Pattern,
  type QualityConfig,
  type Weight,
} from './qualityConfig.ts';
import {categoryInference} from './categoryInference.ts';

function compile({text, regex, sensitive}: Pattern) {
  const expression = regex
    ? text
    : '(?<![\\p{L}\\p{N}])(?:' +
      text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      ')(?![\\p{L}\\p{N}])';
  return new RegExp(expression, sensitive ? 'u' : 'iu');
}

function evaluatePattern(pattern: Pattern) {
  const expression = compile(pattern);
  const restricted = pattern.regex && !isBuiltinRegex(pattern.text);
  return (text: string) => expression.exec(restricted ? text.slice(0, 512) : text);
}

export function createQualityModel(model: QualityConfig) {
  const inference = categoryInference(model.rules, model.categoryMargin);
  const rules = model.rules.map((rule) => ({
    ...rule,
    expressions: rule.patterns.map(evaluatePattern),
    extra: rule.conditions?.map((condition) => ({
      ...condition,
      evaluate: evaluatePattern(condition),
    })),
  }));
  return (
    title: string,
    size: number | undefined,
    ageDays: number | undefined,
    categoryTitle?: string | null,
  ) => {
    const categoryScores = new Map<number, number>();
    const matched: (Weight & {rule?: string})[] = [];
    let titleEvidence = false;

    function add(weight: Weight, fromTitle: boolean, rule?: string) {
      if (weight.criterion === 'date' && ageDays === undefined) return;
      if (weight.criterion === 'category') {
        if (weight.categoryId === undefined) return;
        const id = weight.categoryId;
        categoryScores.set(id, (categoryScores.get(id) ?? 0) + weight.points);
        titleEvidence ||= fromTitle;
      } else {
        matched.push({...weight, rule});
      }
    }

    for (const rule of rules) {
      if (!inRange(size, rule.minBytes, rule.maxBytes)) continue;
      if (!inRange(ageDays, rule.minAgeDays, rule.maxAgeDays)) continue;
      const match = rule.expressions.reduce<RegExpExecArray | null>(
        (match, evaluate) => match ?? evaluate(title),
        null,
      );
      if (!match) continue;
      for (const weight of rule.weights) add(weight, match[0].length > 0, rule.title);
      for (const condition of rule.extra ?? []) {
        const part =
          condition.scope === 'before'
            ? title.slice(0, match.index)
            : condition.scope === 'after'
              ? title.slice(match.index + match[0].length)
              : title;
        const extraMatch = condition.evaluate(part);
        if (extraMatch) add(condition, extraMatch[0].length > 0, rule.title);
      }
    }

    const candidates = titleEvidence
      ? qualityCategoryIds
          .map((id) => ({id, points: categoryScores.get(id) ?? 0}))
          .sort((left, right) => right.points - left.points)
      : [];
    const [best, next] = candidates;
    const inferredCategory =
      best && next && inference.accepts(best.id, best.points - next.points, title)
        ? best.id
        : undefined;
    return {
      categoryId: inference.fromRubric(categoryTitle) ?? inferredCategory,
      score(categoryId: number) {
        let technical = 0;
        let metadata = 0;
        const contributions = matched.filter(
          (weight) => weight.categoryId === undefined || weight.categoryId === categoryId,
        );
        for (const weight of contributions) {
          if (weight.criterion === 'date' || weight.criterion === 'size') {
            metadata += weight.points;
          } else {
            technical += weight.points;
          }
        }
        return {
          value: technical + metadata,
          contributions,
        };
      },
    };
  };
}

function inRange(value: number | undefined, min?: number, max?: number) {
  if (min === undefined && max === undefined) return true;
  return (
    value !== undefined &&
    Number.isFinite(value) &&
    (min === undefined || value >= min) &&
    (max === undefined || value < max)
  );
}

const models = new WeakMap<
  QualityConfig['rules'],
  Map<number, ReturnType<typeof createQualityModel>>
>();

function modelFor(config: QualityConfig) {
  let byMargin = models.get(config.rules);
  if (!byMargin) {
    byMargin = new Map();
    models.set(config.rules, byMargin);
  }
  let model = byMargin.get(config.categoryMargin);
  if (!model) {
    model = createQualityModel(config);
    // Preview can cycle through many margins for the same set of rules.
    if (byMargin.size >= 4) byMargin.clear();
    byMargin.set(config.categoryMargin, model);
  }
  return model;
}

export function calculateQuality(
  config: QualityConfig,
  result: {
    title: string;
    categoryTitle?: string | null;
    size?: number;
    date?: number;
    seeds?: number;
    peers?: number;
    relevance: number;
  },
  now: number,
  defineCategory: boolean,
) {
  const {title, categoryTitle, size, date, seeds, peers, relevance} = result;
  const age =
    config.includeDate && date && date > 0 && date <= now ? (now - date) / 86400 : undefined;
  const weights = modelFor(config)(title, size, age, categoryTitle);
  const inferredCategoryId = weights.categoryId ?? -1;
  const score = weights.score(inferredCategoryId);
  const seedBonus =
    config.includeSeeds && Number.isFinite(seeds) && seeds! >= config.seedMin
      ? config.seedPoints
      : 0;
  const peerBonus =
    config.includeLeeches && Number.isFinite(peers) && peers! >= config.leechMin
      ? config.leechPoints
      : 0;
  return {
    quality: Math.round(relevance + score.value + seedBonus + peerBonus),
    categoryId: defineCategory ? inferredCategoryId : -1,
    score,
    seedBonus,
    peerBonus,
  };
}

export function collectQualityWeights(
  title: string,
  size: number | undefined,
  ageDays: number | undefined,
) {
  return modelFor(defaults)(title, size, ageDays);
}
