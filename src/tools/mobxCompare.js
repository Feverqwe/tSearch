import {escapeJsonPath, getType, isArrayType, isMapType, isStateTreeNode, resolvePath} from "mobx-state-tree";
import {compare, unescapePathComponent} from "fast-json-patch";

const getParentPath = (path) => {
  return path.substr(0, path.lastIndexOf('/'));
};

const mobxCompare = (mobxOldValue, newValue) => {
  let oldValue = null;
  if (isStateTreeNode(mobxOldValue) && isMapType(getType(mobxOldValue))) {
    oldValue = mobxOldValue.toJSON();
  } else {
    oldValue = mobxOldValue;
  }
  return compare(oldValue, newValue).filter((patch) => {
    patch.path = patch.path.split('/').map(part => escapeJsonPath(unescapePathComponent(part))).join('/');

    if (patch.op === 'remove') {
      const value = resolvePath(mobxOldValue, patch.path);
      if (value === undefined) {
        return false;
      }

      const placePath = getParentPath(patch.path);
      if (placePath !== patch.path) {
        const place = resolvePath(mobxOldValue, placePath);
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

export default mobxCompare;