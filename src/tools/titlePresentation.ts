export type Bracket = '(' | '[' | '{' | '<';
export type TitleTone = 'normal' | 'muted' | 'accent';

export interface TitlePresentation {
  version: 1;
  highlight: boolean;
  brackets: Record<Bracket, TitleTone>;
}

export const defaultTitlePresentation: TitlePresentation = {
  version: 1,
  highlight: true,
  brackets: {'(': 'muted', '[': 'muted', '{': 'muted', '<': 'muted'},
};

export interface TitleMatch {
  start: number;
  end: number;
}

export interface TitleSpan {
  text: string;
  bracket?: Bracket;
  match: boolean;
}

const openers = new Set<string>(['(', '[', '{', '<']);
const closers = new Map<string, Bracket>([
  [')', '('],
  [']', '['],
  ['}', '{'],
  ['>', '<'],
]);

export function titleSpans(text: string, matches: readonly TitleMatch[]): TitleSpan[] {
  const open: {bracket: Bracket; start: number}[] = [];
  const groups = new Map<number, {bracket: Bracket; end: number}>();
  for (let offset = 0; offset < text.length; offset++) {
    const char = text[offset];
    if (openers.has(char)) {
      open.push({bracket: char as Bracket, start: offset});
      continue;
    }
    const bracket = closers.get(char);
    if (!bracket) continue;
    const index = open.findLastIndex((group) => group.bracket === bracket);
    if (index < 0) continue;
    groups.set(open[index].start, {bracket, end: offset + 1});
    open.length = index;
  }

  const active: {bracket: Bracket; end: number}[] = [];
  const result: TitleSpan[] = [];
  let matchIndex = 0;
  let start = 0;
  let previous: Omit<TitleSpan, 'text'> | undefined;
  for (let offset = 0; offset < text.length; offset++) {
    while (active.at(-1)?.end === offset) active.pop();
    const group = groups.get(offset);
    if (group) active.push(group);
    while (matchIndex < matches.length && matches[matchIndex].end <= offset) matchIndex++;
    const match = (matches[matchIndex]?.start ?? Infinity) <= offset;
    const bracket = active.at(-1)?.bracket;
    if (!previous || previous.bracket !== bracket || previous.match !== match) {
      if (previous) result.push({...previous, text: text.slice(start, offset)});
      start = offset;
      previous = {bracket, match};
    }
  }
  if (previous) result.push({...previous, text: text.slice(start)});
  return result;
}

export function readTitlePresentation(value: unknown): TitlePresentation {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1)
    return defaultTitlePresentation;
  const {highlight, brackets} = value as Partial<TitlePresentation>;
  const normalized = {...defaultTitlePresentation.brackets};
  for (const opener of Object.keys(normalized) as Bracket[]) {
    const tone = brackets?.[opener];
    if (tone === 'muted' || tone === 'normal' || tone === 'accent') normalized[opener] = tone;
  }
  return {
    version: 1,
    highlight: typeof highlight === 'boolean' ? highlight : defaultTitlePresentation.highlight,
    brackets: normalized,
  };
}
