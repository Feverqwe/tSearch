import {defaults, type QualityRule} from './qualityConfig.ts';

// Stronger margins for labels that are easily confused in the title-only model.
const categoryMargins: Readonly<Record<number, number>> = {
  0: 80,
  3: 55,
  4: 55,
  7: 70,
  8: 55,
  10: 55,
  11: 70,
};

const adultTitle =
  /(?<![\p{L}\p{N}])(?:порно|порнографи[яию]|видео для взрослых|adult[ ._-]+video|nsfw|hentai|хентай)(?![\p{L}\p{N}])/iu;
const animeTitle =
  /(?<![\p{L}\p{N}])(?:аниме|anime|ova|ona|fansub|j(?:ap|pn)\s*\+\s*sub)(?![\p{L}\p{N}])/iu;
const mixedRubric =
  /фильмы\s*(?:и|или|[,/])\s*сериалы|сериалы\s*(?:и|или|[,/])\s*фильмы|аниме\s*(?:и|или|[,/])\s*манга/iu;
const rubricPatterns: readonly (readonly [number, RegExp])[] = [
  [0, /^(?:(?:азиатские|зарубежные|русские|отечественные|новинки и) )?сериалы?(?=$|[\s(:-])/iu],
  [
    4,
    /^(?:(?:зарубежные|отечественные) )?мульт(?:фильмы|сериалы)(?=$|[\s(:-])|^мульт\s+-\s+(?:буржуйский|русский)$|^анимация\s*\(/iu,
  ],
  [7, /^(?:мульт\s+-\s+)?аниме(?=$|[\s(:-])|^онгоинги\s*\(/iu],
  [8, /^(?:\[док\]|(?:кино\s+-\s+)?документальн\p{L}*|архив документалистики)(?=$|[\s(/:-])/iu],
  [9, /^кино\s+-\s+спорт$|^спорт$/iu],
  [10, /^(?:18\+|xxx|порно|видео для взрослых|adult video)$/iu],
  [
    11,
    /^(?:кино\s+-\s+(?:передачи\s*\/\s*)?тв-шоу|развлекательные телепередачи|юмор)(?=$|[\s(:-])/iu,
  ],
];

const filmRubric =
  /^(?:(?:зарубежное|наше|отечественное) кино|(?:зарубежные |отечественные )?фильмы)(?=$|[\s(:-])|^кино\s+-\s+(?:боевик|классика|комедия|исторический|наше кино|приключения|детский|фантастика|фэнтези|триллер|драма|мелодрама|ужас|индийское|азиатский)(?=$|[\s/])/iu;

function rubricCategory(title?: string | null) {
  const label = title?.trim();
  if (!label || mixedRubric.test(label)) return undefined;
  const matching = rubricPatterns.filter(([, pattern]) => pattern.test(label));
  if (matching.length === 1) return matching[0][0];
  return matching.length === 0 && filmRubric.test(label) ? 3 : undefined;
}

function categoryRulesKey(rules: QualityRule[]) {
  return rules
    .flatMap(({patterns, weights, conditions, minBytes, maxBytes, minAgeDays, maxAgeDays}) => {
      const categoryWeights = weights.filter(({criterion}) => criterion === 'category');
      const categoryConditions =
        conditions?.filter(({criterion}) => criterion === 'category') ?? [];
      if (!categoryWeights.length && !categoryConditions.length) return [];
      return [
        JSON.stringify([
          patterns.map(({text, regex, sensitive}) => [text, Boolean(regex), Boolean(sensitive)]),
          categoryWeights.map(({categoryId, points}) => [categoryId, points]),
          categoryConditions.map(({text, regex, sensitive, categoryId, points, scope}) => [
            text,
            Boolean(regex),
            Boolean(sensitive),
            categoryId,
            points,
            scope,
          ]),
          minBytes,
          maxBytes,
          minAgeDays,
          maxAgeDays,
        ]),
      ];
    })
    .sort()
    .join('\n');
}

const stockRulesKey = categoryRulesKey(defaults.rules);

export function categoryInference(rules: QualityRule[], margin: number) {
  const builtIn = rules === defaults.rules || categoryRulesKey(rules) === stockRulesKey;
  return {
    fromRubric: builtIn ? rubricCategory : () => undefined,
    accepts(id: number, lead: number, title: string) {
      if (!builtIn) return lead >= margin;
      const categoryMargin = id === 7 && !animeTitle.test(title) ? 100 : categoryMargins[id];
      return (
        lead >= Math.max(margin, defaults.categoryMargin, categoryMargin ?? 0) &&
        (id !== 10 || lead >= 160 || adultTitle.test(title))
      );
    },
  };
}
