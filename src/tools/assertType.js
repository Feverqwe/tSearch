import {ErrorWithCode} from "./errors";

const assertType = (inType, outType, fn) => {
  if (inType && outType) {
    return value => outType(fn(inType(value)));
  } else
  if (inType) {
    return value => fn(inType(value));
  } else {
    return value => outType(fn(value));
  }
};

/**
 * @param value
 * @return {Node}
 */
const isNode = value => {
  if (!value || !value.nodeType) {
    const err = new ErrorWithCode('Value is not Node', 'IS_NOT_NODE');
    err.value = value;
    throw err;
  }
  return value;
};

/**
 * @param value
 * @return {Element}
 */
const isElement = value => {
  if (!value || value.nodeType !== 1) {
    const err = new ErrorWithCode('Value is not Element', 'IS_NOT_ELEMENT');
    err.value = value;
    throw err;
  }
  return value;
};

/**
 * @param value
 * @return {String}
 */
const isString = value => {
  if (typeof value !== 'string') {
    const err = new ErrorWithCode('Value is not String', 'IS_NOT_STRING');
    err.value = value;
    throw err;
  }
  return value;
};

/**
 * @param value
 * @return {Number}
 */
const isNumber = value => {
  if (!Number.isFinite(value)) {
    const err = new ErrorWithCode('Value is not Finite Number', 'IS_NOT_NUMBER');
    err.value = value;
    throw err;
  }
  return value;
};

export default assertType;
export {
  isNode,
  isElement,
  isString,
  isNumber,
};