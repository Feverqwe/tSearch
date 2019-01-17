import storageGet from "./storageGet";
import storageSet from "./storageSet";

const uuid = require('uuid/v4');

let uuidCache = null;

const getUserId = () => {
  if (uuidCache) {
    return Promise.resolve(uuidCache);
  }
  return storageGet('uuid').then(storage => {
    if (!storage.uuid) {
      storage.uuid = uuid();
      return storageSet(storage).then(() => storage.uuid);
    } else {
      return storage.uuid;
    }
  }).then(uuid => {
    return uuidCache = uuid;
  });
};

export default getUserId;