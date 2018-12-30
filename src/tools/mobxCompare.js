import {compare, getValueByPointer} from "fast-json-patch";

const getParentPath = (path) => {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/');
};

const mobxCompare = (oldValue, newValue) => {
  return compare(oldValue, newValue).filter((patch) => {
    if (patch.op === 'remove') {
      const value = getValueByPointer(oldValue, patch.path);
      if (value === undefined) {
        return false;
      }

      const placePath = getParentPath(patch.path);
      if (placePath !== patch.path) {
        const place = getValueByPointer(oldValue, placePath);
        if (typeof place === 'object' && place !== null && !Array.isArray(place)) {
          patch.op = 'replace';
          patch.value = undefined;
        }
      }
    }
    return true;
  });
};

export default mobxCompare;