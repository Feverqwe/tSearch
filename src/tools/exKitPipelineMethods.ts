import assertType, {isElement, isNode, isNumber, isString} from './assertType.ts';

export interface PipelineArgument {
  name: string;
  type: 'string' | 'number' | 'select';
  values?: ReadonlyArray<{key: number; text: string}>;
}

type Method = (value: unknown) => unknown;
interface PipelineMethod {
  in: 'node' | 'string' | 'number';
  out: 'node' | 'string' | 'number';
  args?: readonly PipelineArgument[];
  multipleArgs?: boolean;
  getMethod(...args: unknown[]): Method | Promise<Method>;
}

const exKitPipelineMethods: Record<string, PipelineMethod> = {
  getAttr: {
    in: 'node',
    args: [
      {
        name: 'Attribute',
        type: 'string',
      },
    ],
    out: 'string',
    getMethod(attr) {
      return assertType(isElement, isString, (value) => value.getAttribute(isString(attr)));
    },
  },
  getProp: {
    in: 'node',
    args: [
      {
        name: 'Property',
        type: 'string',
      },
    ],
    out: 'string',
    getMethod(prop) {
      return assertType(
        isElement,
        isString,
        (value) => (value as unknown as Record<string, unknown>)[isString(prop)],
      );
    },
  },
  getText: {
    in: 'node',
    out: 'string',
    getMethod() {
      return assertType(isNode, isString, (value) => value.textContent);
    },
  },
  getHtml: {
    in: 'node',
    out: 'string',
    getMethod() {
      return assertType(isElement, isString, (value) => value.innerHTML);
    },
  },
  getChild: {
    in: 'node',
    args: [
      {
        name: 'Index',
        type: 'number',
      },
    ],
    out: 'node',
    getMethod(value) {
      const index = Number(value);
      if (index < 0) {
        return assertType(
          isNode,
          isNode,
          (value) => value.childNodes[value.childNodes.length + index],
        );
      } else {
        return assertType(isNode, isNode, (value) => value.childNodes[index]);
      }
    },
  },

  trim: {
    in: 'string',
    out: 'string',
    getMethod() {
      return assertType(isString, isString, (value) => value.trim());
    },
  },

  replace: {
    in: 'string',
    args: [
      {
        name: 'Pattern',
        type: 'string',
      },
      {
        name: 'ReplaceTo',
        type: 'string',
      },
    ],
    out: 'string',
    getMethod(pattern, replaceTo) {
      return assertType(isString, isString, (value) =>
        value.replace(isString(pattern), isString(replaceTo)),
      );
    },
  },

  replaceRe: {
    in: 'string',
    args: [
      {
        name: 'Pattern',
        type: 'string',
      },
      {
        name: 'ReplaceTo',
        type: 'string',
      },
    ],
    out: 'string',
    getMethod(reStr, replaceTo) {
      const re = new RegExp(isString(reStr), 'ig');
      return assertType(isString, isString, (value) => value.replace(re, isString(replaceTo)));
    },
  },

  parseDate: {
    in: 'string',
    args: [
      {
        name: 'Format',
        type: 'string',
      },
    ],
    out: 'number',
    getMethod(format) {
      return import('fecha').then((module) => {
        const fechaParse = module.parse;
        return assertType(isString, isNumber, (value) => {
          const date = fechaParse(value, isString(format));
          return date ? date.getTime() / 1000 : undefined;
        });
      });
    },
  },
  parseIsoDate: {
    in: 'string',
    out: 'number',
    getMethod() {
      return assertType(isString, isNumber, (value) => Date.parse(value) / 1000);
    },
  },
  parseSize: {
    in: 'string',
    out: 'number',
    getMethod() {
      return import('filesize-parser').then((module) => {
        return assertType(isString, isNumber, (value) => {
          try {
            return module.default(value);
          } catch (error) {
            throw typeof error === 'string' ? new Error(error) : error;
          }
        });
      });
    },
  },
  toInt: {
    in: 'string',
    out: 'number',
    getMethod() {
      return assertType(isString, isNumber, (value) => parseInt(value, 10));
    },
  },
  toFloat: {
    in: 'string',
    out: 'number',
    getMethod() {
      return assertType(isString, isNumber, (value) => parseFloat(value));
    },
  },

  legacyReplaceToday: {
    in: 'string',
    out: 'string',
    getMethod() {
      return import('../tools/exKitLegacyFn').then((module) => {
        const legacyReplaceToday = module.todayReplace;
        return assertType(isString, isString, (value) => legacyReplaceToday(value));
      });
    },
  },
  legacyReplaceMonth: {
    in: 'string',
    out: 'string',
    getMethod() {
      return import('../tools/exKitLegacyFn').then((module) => {
        const legacyReplaceMonth = module.monthReplace;
        return assertType(isString, isString, (value) => legacyReplaceMonth(value));
      });
    },
  },
  legacyParseDate: {
    in: 'string',
    args: [
      {
        name: 'Template',
        type: 'select',
        values: [
          {key: 0, text: '2013-04-31[[[ 07]:03]:27]'},
          {key: 1, text: '31-04-2013[[[ 07]:03]:27]'},
          {key: 2, text: 'n day ago'},
          {key: 3, text: '04-31-2013[[[ 07]:03]:27]'},
          {key: 4, text: '2d 1h 0m 0s ago'},
        ],
      },
    ],
    out: 'number',
    getMethod(format) {
      return import('../tools/exKitLegacyFn').then((module) => {
        const legacyParseDate = module.dateFormat;
        return assertType(isString, isNumber, (value) => legacyParseDate(String(format), value));
      });
    },
  },
  legacySizeFormat: {
    in: 'string',
    out: 'number',
    getMethod() {
      return import('./exKitLegacyFn.ts').then((module) => {
        const legacySizeFormat = module.sizeFormat;
        return assertType(isString, isNumber, (value) => legacySizeFormat(value));
      });
    },
  },
};

export default exKitPipelineMethods;
