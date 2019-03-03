import sizzle from "sizzle";

const sizzleQuerySelector = (target, selector) => {
  const results = [];
  if (isRequired(selector)) {
    sizzle(selector, target, results);
  } else {
    results.push(target.querySelector(selector));
  }
  return results[0] || null;
};

const sizzleQuerySelectorAll = (target, selector) => {
  const results = [];
  if (isRequired(selector)) {
    sizzle(selector, target, results);
  } else {
    results.push(...target.querySelectorAll(selector));
  }
  return results;
};

const isRequired = selector => {
  return /[^:]:(not|has|contains|empty|parent|header|first|last|eq|even|odd|lt|gt)|^[~+]/.test(selector);
};

export {
  sizzleQuerySelector,
  sizzleQuerySelectorAll
};