import {RegExpParser, visitRegExpAST, type AST} from '@eslint-community/regexpp';
import baselineWeights from './qualityWeights.json' with {type: 'json'};

export const criteria = [
  'resolution',
  'video',
  'audio',
  'game',
  'category',
  'size',
  'date',
] as const;
export const qualityCategoryIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type Criterion = (typeof criteria)[number];

export interface Pattern {
  text: string;
  regex?: boolean;
  sensitive?: boolean;
}
export interface Weight {
  criterion: Criterion;
  points: number;
  categoryId?: number;
}
export interface Condition extends Pattern, Weight {
  scope: 'any' | 'before' | 'after';
}
export interface QualityRule {
  title?: string;
  patterns: Pattern[];
  weights: Weight[];
  conditions?: Condition[];
  minBytes?: number;
  maxBytes?: number;
  minAgeDays?: number;
  maxAgeDays?: number;
}
export interface QualityConfig {
  version: 1;
  categoryMargin: number;
  includeDate: boolean;
  includeSeeds: boolean;
  seedMin: number;
  seedPoints: number;
  includeLeeches: boolean;
  leechMin: number;
  leechPoints: number;
  rules: QualityRule[];
}

export const defaults: QualityConfig = {
  version: 1,
  categoryMargin: baselineWeights.categoryMargin,
  includeDate: baselineWeights.includeDate,
  includeSeeds: false,
  seedMin: 1,
  seedPoints: 50,
  includeLeeches: false,
  leechMin: 1,
  leechPoints: 10,
  rules: baselineWeights.rules as QualityRule[],
};

// Fingerprint of the validated rule array shipped before the expanded dataset.
const previousBundledRules = '65d888d9451dba48cc77e9148337192b37cb28c7ae89bb77dcb4f7e35d79206f';

export async function upgradeBundledQuality(config: QualityConfig): Promise<QualityConfig> {
  const encoded = new TextEncoder().encode(JSON.stringify(config.rules));
  const fingerprint = await crypto.subtle.digest('SHA-256', encoded);
  const hex = Array.from(new Uint8Array(fingerprint), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  if (hex !== previousBundledRules) return config;

  return {
    ...config,
    rules: defaults.rules,
    categoryMargin:
      config.categoryMargin === 20 || config.categoryMargin === 45
        ? defaults.categoryMargin
        : config.categoryMargin,
  };
}

export const qualityJsonLimit = 1024 * 1024;
const limits = ['minBytes', 'maxBytes', 'minAgeDays', 'maxAgeDays'] as const;
const fields = ['title', 'patterns', 'weights', 'conditions', ...limits];
const configFields = Object.keys(defaults);
const patternFields = ['text', 'regex', 'sensitive'];
const weightFields = ['criterion', 'categoryId', 'points'];
const builtinRegexes = new Set(
  defaults.rules.flatMap(({patterns, conditions}) =>
    [...patterns, ...(conditions ?? [])].filter(({regex}) => regex).map(({text}) => text),
  ),
);
const parser = new RegExpParser();

export class QualityValidationError extends Error {
  readonly path: string;
  readonly reason: string;
  constructor(path: string, reason: string) {
    super(`${path}: ${reason}`);
    this.path = path;
    this.reason = reason;
  }
}

function reject(path: string, reason: string): never {
  throw new QualityValidationError(path, reason);
}

function record(value: unknown, path: string, validKeys: readonly string[]) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) reject(path, 'object');
  const object = value as Record<string, unknown>;
  for (const key of Object.keys(object))
    if (!validKeys.includes(key)) reject(`${path}.${key}`, 'field');
  return object;
}

function list(value: unknown, path: string, min: number, max: number) {
  if (!Array.isArray(value) || value.length < min || value.length > max) reject(path, 'list');
  return value as unknown[];
}

function scalar(value: unknown, path: string, min: number, max: number, integer = false) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isSafeInteger(value))
  )
    reject(path, 'number');
  return value;
}

function flag(value: unknown, path: string) {
  if (typeof value !== 'boolean') reject(path, 'boolean');
  return value;
}

function checkRegex(text: string, path: string) {
  if (builtinRegexes.has(text)) return;
  try {
    const ast = parser.parsePattern(text, 0, text.length, {unicode: true});
    // Bound custom patterns to simple repeated atoms and avoid expensive backtracking constructs.
    let repetitions = 0;
    let optional = 0;
    visitRegExpAST(ast, {
      onBackreferenceEnter: () => reject(path, 'complexity'),
      onQuantifierEnter(node) {
        if (node.max === 1) {
          if (node.min === 0 && ++optional > 6) reject(path, 'complexity');
          return;
        }
        if (node.max > 64 && node.max !== Infinity) reject(path, 'complexity');
        if (!['Character', 'CharacterClass', 'CharacterSet'].includes(node.element.type))
          reject(path, 'complexity');
        if (++repetitions > 1) reject(path, 'complexity');
        for (let parent: AST.Node | null = node.parent; parent; parent = parent.parent) {
          if (parent.type === 'Assertion') reject(path, 'complexity');
        }
      },
    });
  } catch (error) {
    if (error instanceof QualityValidationError) throw error;
    reject(path, 'regex');
  }
}

function pattern(value: Record<string, unknown>, path: string): Pattern {
  const {text, regex, sensitive} = value;
  if (typeof text !== 'string' || !text.trim() || text.length > 256) reject(`${path}.text`, 'text');
  const result: Pattern = {text: regex ? text : text.trim()};
  if (regex !== undefined) result.regex = flag(regex, `${path}.regex`);
  if (sensitive !== undefined) result.sensitive = flag(sensitive, `${path}.sensitive`);
  if (result.regex) checkRegex(result.text, `${path}.text`);
  return result;
}

function weight(value: Record<string, unknown>, path: string): Weight {
  const {criterion, categoryId, points} = value;
  if (!criteria.includes(criterion as Criterion)) reject(`${path}.criterion`, 'criterion');
  if (
    (categoryId !== undefined || criterion === 'category') &&
    !qualityCategoryIds.includes(categoryId as (typeof qualityCategoryIds)[number])
  ) {
    reject(`${path}.categoryId`, 'category');
  }
  return {
    criterion: criterion as Criterion,
    points: scalar(points, `${path}.points`, -999, 999),
    ...(categoryId === undefined ? {} : {categoryId: categoryId as number}),
  };
}

export function validateQualityRule(value: unknown, path = 'rule'): QualityRule {
  const data = record(value, path, fields);
  const rule: QualityRule = {
    patterns: list(data.patterns, `${path}.patterns`, 1, 32).map((item, i) => {
      const pathTo = `${path}.patterns[${i}]`;
      return pattern(record(item, pathTo, patternFields), pathTo);
    }),
    weights: list(data.weights, `${path}.weights`, 1, 48).map((item, i) => {
      const pathTo = `${path}.weights[${i}]`;
      return weight(record(item, pathTo, weightFields), pathTo);
    }),
  };
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.length > 200) reject(`${path}.title`, 'text');
    rule.title = data.title;
  }
  for (const key of limits)
    if (data[key] !== undefined) {
      rule[key] = scalar(data[key], `${path}.${key}`, 0, Number.MAX_SAFE_INTEGER, true);
    }
  if (rule.minBytes !== undefined && rule.maxBytes !== undefined && rule.minBytes >= rule.maxBytes)
    reject(`${path}.maxBytes`, 'range');
  if (
    rule.minAgeDays !== undefined &&
    rule.maxAgeDays !== undefined &&
    rule.minAgeDays >= rule.maxAgeDays
  )
    reject(`${path}.maxAgeDays`, 'range');
  if (data.conditions !== undefined) {
    rule.conditions = list(data.conditions, `${path}.conditions`, 0, 32).map((item, i) => {
      const pathTo = `${path}.conditions[${i}]`;
      const data = record(item, pathTo, [...patternFields, ...weightFields, 'scope']);
      const scope = data.scope;
      if (scope !== 'any' && scope !== 'before' && scope !== 'after')
        reject(`${pathTo}.scope`, 'scope');
      return {...pattern(data, pathTo), ...weight(data, pathTo), scope};
    });
  }
  return rule;
}

type ImportDocument = {version: 1} & Partial<Omit<QualityConfig, 'version'>>;

export function validateQualityImport(value: unknown): ImportDocument {
  const data = record(value, 'JSON', configFields);
  if (data.version !== 1) reject('version', 'version');
  const result: ImportDocument = {version: 1};
  for (const key of ['includeSeeds', 'includeLeeches', 'includeDate'] as const) {
    if (data[key] !== undefined) result[key] = flag(data[key], key);
  }
  for (const key of ['seedMin', 'leechMin'] as const) {
    if (data[key] !== undefined) result[key] = scalar(data[key], key, 1, 999999, true);
  }
  for (const key of ['seedPoints', 'leechPoints'] as const) {
    if (data[key] !== undefined) result[key] = scalar(data[key], key, -999, 999);
  }
  if (data.categoryMargin !== undefined) {
    result.categoryMargin = scalar(
      data.categoryMargin,
      'categoryMargin',
      Number.MIN_VALUE,
      Number.MAX_SAFE_INTEGER,
    );
  }
  if (data.rules !== undefined) {
    result.rules = list(data.rules, 'rules', 0, 512).map((rule, i) =>
      validateQualityRule(rule, `rules[${i}]`),
    );
  }
  if (Object.keys(result).length === 1) reject('rules', 'list');
  return result;
}

export function parseQualityImport(text: string) {
  if (text.length > qualityJsonLimit) reject('JSON', 'length');
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    reject('JSON', 'syntax');
  }
  return validateQualityImport(value);
}

function patternKey({text, regex, sensitive}: Pattern) {
  return JSON.stringify([
    regex || sensitive ? text : text.toLowerCase(),
    Boolean(regex),
    Boolean(sensitive),
  ]);
}
function weightKey({criterion, categoryId}: Weight) {
  return JSON.stringify([criterion, categoryId]);
}
function conditionKey(condition: Condition) {
  return JSON.stringify([condition.scope, patternKey(condition), weightKey(condition)]);
}
function ruleKey(rule: QualityRule) {
  return JSON.stringify([
    rule.patterns.map(patternKey).sort(),
    rule.weights.map(weightKey).sort(),
    (rule.conditions ?? []).map(conditionKey).sort(),
    limits.map((key) => rule[key]),
  ]);
}
function updatePoints<T extends Weight>(
  original: T[],
  replacements: T[],
  key: (weight: T) => string,
) {
  const sources = new Map<string, T[]>();
  for (const part of replacements) {
    const k = key(part);
    if (!sources.has(k)) sources.set(k, []);
    sources.get(k)!.push(part);
  }
  return original.map((part) => {
    const replacement = sources.get(key(part))?.shift();
    return replacement ? {...part, points: replacement.points} : part;
  });
}
export function planQualityImport(base: QualityConfig, text: string, mode: 'merge' | 'replace') {
  const imported = parseQualityImport(text);
  const replaced = mode === 'replace' && imported.rules !== undefined ? base.rules.length : 0;
  const rules = mode === 'replace' && imported.rules !== undefined ? [] : [...base.rules];
  const indices = new Map(rules.map((rule, index) => [ruleKey(rule), index]));
  let added = 0;
  let updated = 0;
  for (const rule of imported.rules ?? []) {
    const k = ruleKey(rule);
    const index = mode === 'merge' ? indices.get(k) : undefined;
    if (index === undefined) {
      indices.set(k, rules.length);
      rules.push(rule);
      added++;
    } else {
      const original = rules[index];
      rules[index] = {
        ...original,
        weights: updatePoints(original.weights, rule.weights, weightKey),
      };
      if (original.conditions) {
        rules[index].conditions = updatePoints(
          original.conditions,
          rule.conditions ?? [],
          conditionKey,
        );
      }
      updated++;
    }
  }
  if (rules.length > 512) reject('rules', 'list');
  return {config: {...base, ...imported, rules}, added, updated, replaced};
}

export function isBuiltinRegex(text: string) {
  return builtinRegexes.has(text);
}
