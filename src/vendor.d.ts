declare module 'querystring-es3' {
  type Value = string | number | boolean | null | undefined;
  export function parse(value: string): Record<string, string | string[]>;
  export function stringify(value: Record<string, Value | readonly Value[]>): string;
  export default {parse, stringify};
}

declare module 'filesize-parser' {
  export default function parseSize(text: string): number;
}
