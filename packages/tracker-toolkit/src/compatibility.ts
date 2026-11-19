import type {Rule} from './types.ts';

// The generator targets this subset of the published ExKit v3 operations.
// Adding an operation to the local runtime must not expand this list automatically.
const portableOperations = new Set([
  'getAttr',
  'getProp',
  'getText',
  'trim',
  'replaceRe',
  'toInt',
  'parseIsoDate',
  'legacyReplaceToday',
  'legacyReplaceMonth',
  'legacyParseDate',
  'legacySizeFormat',
]);

export function assertPortableRules(selectors: Record<string, Rule | number | undefined>) {
  for (const rule of Object.values(selectors)) {
    if (!rule || typeof rule === 'number') continue;
    for (const {name} of rule.pipeline ?? []) {
      if (!portableOperations.has(name)) throw new Error(`Unsupported ExKit v3 operation: ${name}`);
    }
  }
}
