import {compareVersions} from 'compare-versions';
import getLogger from './getLogger.ts';

const debug = getLogger('getCodeMeta');

type FieldType = 'string' | 'number' | 'array' | 'object';
type Rule = FieldType | `${FieldType}!${string}` | `*${FieldType}` | `*${FieldType}!${string}`;
type Schema = Record<string, Rule>;
export type LocaleMap = Record<string, Record<string, string>>;
export interface ModuleAction {
  title: string;
  command: string;
  icon?: string;
}

type Decode<T extends Rule> = T extends `*${infer Rest extends Rule}`
  ? Decode<Rest>
  : T extends 'array!action'
    ? ModuleAction[]
    : T extends 'object!locale'
      ? LocaleMap
      : T extends `${infer Kind extends FieldType}!${string}`
        ? Decode<Kind>
        : T extends 'string'
          ? string
          : T extends 'number'
            ? number
            : T extends 'array'
              ? string[]
              : Record<string, string>;

type Metadata<S extends Schema> = {
  [Key in keyof S as S[Key] extends `*${string}` ? Key : never]: Decode<S[Key]>;
} & {
  [Key in keyof S as S[Key] extends `*${string}` ? never : Key]?: Decode<S[Key]>;
};

type RawField = string | number | string[] | Record<string, string>;

export default function getCodeMeta<S extends Schema>(code: string, schema: S): Metadata<S> {
  const fields = new Map<string, RawField>();
  let inHeader = false;
  for (const line of code.split(/\r?\n/)) {
    if (!/^\s*\/\//.test(line)) continue;
    if (!inHeader && /[=]+UserScript[=]+/.test(line)) inHeader = true;
    if (!inHeader) continue;
    if (/[=]+\/UserScript[=]+/.test(line)) break;
    const match = /^\s*\/\/\s*@([A-Za-z0-9]+)\s+(.+)$/.exec(line);
    if (!match) continue;
    const [, key, text] = match;
    if (!Object.hasOwn(schema, key)) {
      debug(`Skip meta key ${key}: ${text.trim()}`);
      continue;
    }
    fields.set(key, decodeRawField(key, schema[key], text.trim(), fields.get(key)));
  }

  const result = Object.fromEntries(fields) as Record<string, unknown>;
  for (const [key, rule] of Object.entries(schema)) {
    const value = fields.get(key);
    if (!value && rule.startsWith('*')) throw new Error(`Field ${key} is important!`);
    if (value === undefined) continue;
    try {
      switch (rule.split('!')[1]) {
        case 'version':
          if (typeof value !== 'string') throw new TypeError('Expected a version string');
          compareVersions(value, value);
          break;
        case 'connect':
          if (!Array.isArray(value)) throw new TypeError('Expected connection patterns');
          result[key] = value.filter(Boolean);
          if (!(result[key] as string[]).length) throw new Error('Connect field is empty!');
          break;
        case 'action':
          if (!Array.isArray(value)) throw new TypeError('Expected an action list');
          result[key] = value.map((text): ModuleAction => {
            const action = JSON.parse(text) as ModuleAction | null;
            if (!action || !action.title || !action.command) throw new Error('Action is incorrect');
            return action;
          });
          break;
        case 'locale': {
          if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new TypeError('Expected locale entries');
          }
          const locales: LocaleMap = Object.create(null);
          for (const [locale, text] of Object.entries(value)) {
            try {
              locales[locale] = JSON.parse(text) as Record<string, string>;
            } catch (error) {
              debug(`Parse locale ${locale}: ${text}`, error);
            }
          }
          const fallback = String(fields.get('defaultLocale') || 'en');
          if (!locales[fallback]) throw new Error(`Default locale ${fallback} is not found!`);
          result.defaultLocale = fallback;
          result[key] = locales;
          break;
        }
      }
    } catch (cause) {
      throw new Error(`Invalid metadata field ${key}`, {cause});
    }
  }
  return result as Metadata<S>;
}

function decodeRawField(key: string, rule: Rule, text: string, previous?: RawField): RawField {
  const type = rule.replace(/^\*/, '').split('!')[0] as FieldType;
  switch (type) {
    case 'string':
      return text;
    case 'number': {
      const value = Number.parseInt(text, 10);
      if (!Number.isFinite(value)) throw new Error(`Invalid metadata field ${key}: ${text}`);
      return value;
    }
    case 'array':
      return [...(Array.isArray(previous) ? previous : []), text];
    case 'object': {
      const match = /^(\S+)\s+(.+)$/.exec(text);
      if (!match) throw new Error(`Invalid metadata field ${key}: ${text}`);
      const dictionary = typeof previous === 'object' && !Array.isArray(previous) ? previous : {};
      return {...dictionary, [match[1]]: match[2].trim()};
    }
  }
}
