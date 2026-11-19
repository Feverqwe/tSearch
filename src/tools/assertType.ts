import {ErrorWithCode} from './errors.ts';

export default function assertType<Input, Output>(
  inType: (value: unknown) => Input,
  outType: (value: unknown) => Output,
  fn: (value: Input) => unknown,
): (value: unknown) => Output {
  return (value) => outType(fn(inType(value)));
}

export function isNode(value: unknown): Node {
  if (!value || typeof value !== 'object' || !('nodeType' in value) || !value.nodeType) {
    throw invalidType('Node', 'IS_NOT_NODE', value);
  }
  return value as Node;
}

export function isElement(value: unknown): Element {
  if (!value || typeof value !== 'object' || !('nodeType' in value) || value.nodeType !== 1) {
    throw invalidType('Element', 'IS_NOT_ELEMENT', value);
  }
  return value as Element;
}

export function isString(value: unknown): string {
  if (typeof value !== 'string') throw invalidType('String', 'IS_NOT_STRING', value);
  return value;
}

export function isNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw invalidType('Finite Number', 'IS_NOT_NUMBER', value);
  }
  return value;
}

function invalidType(name: string, code: string, value: unknown) {
  return Object.assign(new ErrorWithCode(`Value is not ${name}`, code), {value});
}
