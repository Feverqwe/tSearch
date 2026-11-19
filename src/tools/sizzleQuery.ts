import sizzle from 'sizzle';

export function sizzleQuerySelector(target: ParentNode, selector: string): Element | null {
  if (selector === ':scope' && target.nodeType === 1) {
    return target as Element;
  }
  return requiresSizzle(selector)
    ? (sizzle(selector, target as Document | Element | DocumentFragment)[0] ?? null)
    : target.querySelector(selector);
}

export function sizzleQuerySelectorAll(target: ParentNode, selector: string): Element[] {
  return requiresSizzle(selector)
    ? sizzle(selector, target as Document | Element | DocumentFragment)
    : Array.from(target.querySelectorAll(selector));
}

function requiresSizzle(selector: string) {
  return /[^:]:(not|has|contains|empty|parent|header|first|last|eq|even|odd|lt|gt)|^\s*[~+]/.test(
    selector,
  );
}
