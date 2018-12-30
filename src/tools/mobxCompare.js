import {escapeJsonPath, getType, isArrayType, isMapType, isStateTreeNode, resolvePath} from "mobx-state-tree";
import {compare, unescapePathComponent} from "fast-json-patch";

const getParentPath = (path) => {
  return path.substr(0, path.lastIndexOf('/'));
};

const mobxCompare = (mobxOldValue, newValue) => {
  let oldValue = null;
  if (isMapType(getType(mobxOldValue))) {
    oldValue = mobxOldValue.toJSON();
  } else {
    oldValue = mobxOldValue;
  }
  return compare(oldValue, newValue).filter((patch) => {
    patch.path = patch.path.split('/').map(part => escapeJsonPath(unescapePathComponent(part))).join('/');

    if (patch.op === 'remove') {
      const value = resolvePathFixed(mobxOldValue, patch.path);
      if (value === undefined) {
        return false;
      }

      const placePath = getParentPath(patch.path);
      if (placePath !== patch.path) {
        const place = resolvePathFixed(mobxOldValue, placePath);
        const placeType = getType(place);
        if (!isArrayType(placeType) && !isMapType(placeType)) {
          patch.op = 'replace';
          patch.value = undefined;
        }
      }
    }
    return true;
  });
};

const resolvePathFixed = (store, path) => {
  if (isMapType(getType(store)) && /^\/\//.test(path)) {
    return resolvePath(store.get(''), path.substr(1));
  } else {
    return resolvePath(store, path);
  }
};

export default mobxCompare;