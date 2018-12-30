const reOrderStoreItems = (oldStore, newStore, idKey) => {
  const idNewItem = new Map();
  const idOrder = [];
  newStore.forEach(item => {
    idNewItem.set(item[idKey], item);
    idOrder.push(item[idKey]);
  });
  const idItem = new Map();
  oldStore.forEach((item) => {
    idItem.set(item[idKey], item);
  });
  return idOrder.map(id => {
    const value = idItem.get(id);
    idItem.delete(id);
    return value || idNewItem.get(id);
  });
};

export default reOrderStoreItems;