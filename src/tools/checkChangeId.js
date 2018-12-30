const checkChangeId = (key, storeId, changes) => {
  if (changes[key]) {
    const change = changes[`${key}ChangeId`];
    const keyChangeId = change && change.newValue;
    if (typeof keyChangeId !== 'string' || keyChangeId.indexOf(`${storeId}_`) !== 0) {
      return true;
    }
  }
};

export default checkChangeId;