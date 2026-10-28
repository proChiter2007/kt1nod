let products = [];
let currentId = 1;

const ProductStore = {
  getAll: () => products,
  getById: (id) => products.find(p => p.id === Number(id)),
  create: (data) => {
    const newProduct = {
      id: currentId++,
      createdAt: new Date().toISOString(),
      imageUrl: null,
      ...data
    };
    products.push(newProduct);
    return newProduct;
  },
  replace: (id, data) => {
    const index = products.findIndex(p => p.id === Number(id));
    if (index === -1) return null;
    const existing = products[index];
    products[index] = {
      id: existing.id,
      createdAt: existing.createdAt,
      imageUrl: existing.imageUrl,
      ...data
    };
    return products[index];
  },
  updatePartial: (id, data) => {
    const product = ProductStore.getById(id);
    if (!product) return null;
    Object.assign(product, data);
    return product;
  },
  delete: (id) => {
    const initialLength = products.length;
    products = products.filter(p => p.id !== Number(id));
    return products.length < initialLength;
  },
  setImage: (id, url) => {
    const product = ProductStore.getById(id);
    if (!product) return null;
    product.imageUrl = url;
    return product;
  }
};

module.exports = ProductStore;