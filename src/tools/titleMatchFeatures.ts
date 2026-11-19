import normalizeSearchText from './normalizeSearchText.ts';

export const titleMatchFeatureNames = [
  'coverage',
  'orderedCoverage',
  'phrase',
  'compactness',
  'yearMatch',
  'yearConflict',
  'yearMissing',
] as const;

function tokens(text: string) {
  return (
    normalizeSearchText(text.normalize('NFKC'))
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

function yearTokens(text: string) {
  const withoutDimensions = text
    .normalize('NFKC')
    .replace(/(?<![\p{L}\p{N}])\d{3,5}\s*[xх×*]\s*\d{3,5}[pi]?(?![\p{L}\p{N}])/giu, ' ');
  return tokens(withoutDimensions).filter((word) => /^(?:19|20)\d{2}$/u.test(word));
}

export interface TitleQuery {
  words: string[];
  year?: string;
}

export function prepareTitleQuery(query: string): TitleQuery {
  const words = tokens(query);
  const years = new Set(yearTokens(query));
  const yearIndex = words.findLastIndex(
    (word, index) =>
      index > 0 && years.has(word) && Number(word) <= new Date().getUTCFullYear() + 2,
  );
  const year = yearIndex >= 0 ? words.splice(yearIndex, 1)[0] : undefined;
  return {words, year};
}

export function titleMatchFeatures(query: TitleQuery, title: string) {
  const titleWords = tokens(title);
  const available = new Map<string, number>();
  const positions = new Map<string, number[]>();
  for (const [index, word] of titleWords.entries()) {
    available.set(word, (available.get(word) ?? 0) + 1);
    const indices = positions.get(word) ?? [];
    indices.push(index);
    positions.set(word, indices);
  }
  let matched = 0;
  let ordered = 0;
  let previous = -1;
  for (const word of query.words) {
    const remaining = available.get(word) ?? 0;
    if (remaining > 0) {
      matched++;
      available.set(word, remaining - 1);
    }
    const next = positions.get(word)?.find((index) => index > previous);
    if (next !== undefined) {
      ordered++;
      previous = next;
    }
  }

  let phrase = false;
  let shortest = Infinity;
  for (const start of positions.get(query.words[0]) ?? []) {
    let end = start;
    let complete = true;
    for (const word of query.words.slice(1)) {
      const next = positions.get(word)?.find((index) => index > end);
      if (next === undefined) {
        complete = false;
        break;
      }
      end = next;
    }
    if (complete) {
      shortest = Math.min(shortest, end - start + 1);
      phrase ||= end - start + 1 === query.words.length;
    }
  }

  // Trackers may repeat the same name as its translated/original alias before the release year.
  const aliases = title.split('/');
  if (aliases.length > 1) {
    const first = tokens(aliases[0]);
    const next = tokens(aliases[1]);
    if (
      query.words.length &&
      first.length === query.words.length &&
      query.words.every((word, index) => first[index] === word && next[index] === word)
    ) {
      aliases.shift();
    }
  }
  // Consume only the occurrences used by the name, leaving repeated numbers available as release years.
  const nameYears = new Map<string, number>();
  for (const word of query.words) nameYears.set(word, (nameYears.get(word) ?? 0) + 1);
  const years = yearTokens(aliases.join('/')).filter((word) => {
    const remaining = nameYears.get(word) ?? 0;
    if (!remaining) return true;
    nameYears.set(word, remaining - 1);
    return false;
  });
  const releaseYear = years[0];
  const yearMatch = query.year !== undefined && releaseYear === query.year;
  const yearConflict = query.year !== undefined && releaseYear !== undefined && !yearMatch;
  const yearMissing = query.year !== undefined && releaseYear === undefined;
  const coverage = query.words.length ? matched / query.words.length : 0;
  return {
    values: [
      coverage,
      query.words.length ? ordered / query.words.length : 0,
      Number(phrase),
      Number.isFinite(shortest) ? query.words.length / shortest : 0,
      Number(yearMatch),
      Number(yearConflict),
      Number(yearMissing),
    ],
    tier: yearConflict || !matched ? 0 : coverage < 1 ? 1 : yearMissing ? 2 : 3,
  };
}
