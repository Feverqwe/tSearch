const reOrderStoreItems = (oldStore, newStore, idKey) => {
  const idNewItem = new Map();
  const idOrder = [];
  newStore.forEach(item => {
    idNewItem.set(item[idKey], item);
    idOrder.push(item.id);
  });
  const idItem = new Map();
  oldStore.forEach((item) => {
    idItem.set(item[idKey], item);
  });
  return idOrder.map(id => idItem.get(id) || idNewItem.get(id));
};

export default reOrderStoreItems;