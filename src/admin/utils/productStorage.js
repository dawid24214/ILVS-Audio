const STORAGE_KEY = "ilvs_admin_products";

export function getAdminProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAdminProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent("ilvs:products-updated"));
}

export function addAdminProduct(product) {
  const products = getAdminProducts();
  const nextProducts = [product, ...products];
  saveAdminProducts(nextProducts);
  return nextProducts;
}

export function removeAdminProduct(productId) {
  const nextProducts = getAdminProducts().filter((product) => product.id !== productId);
  saveAdminProducts(nextProducts);
  return nextProducts;
}

export function updateAdminProduct(productId, updates) {
  const products = getAdminProducts();

  const nextProducts = products.map((product) =>
    product.id === productId
      ? {
          ...product,
          ...updates,
          id: product.id,
          updatedAt: new Date().toISOString(),
        }
      : product
  );

  saveAdminProducts(nextProducts);
  return nextProducts.find((product) => product.id === productId) || null;
}

export function getStockStatus(stock) {
  const quantity = Number(stock) || 0;

  if (quantity === 0) return "Brak na magazynie";
  if (quantity <= 5) return "Niski stan";
  return "Aktywny";
}

export function reduceProductStock(orderItems) {
  const products = getAdminProducts();

  const insufficient = orderItems
    .map((item) => {
      const product = products.find((entry) => entry.id === item.id);
      const available = product ? Number(product.stock) || 0 : 0;
      const requested = Number(item.quantity) || 0;

      return requested > available
        ? {
            id: item.id,
            name: item.name,
            requested,
            available,
          }
        : null;
    })
    .filter(Boolean);

  if (insufficient.length > 0) {
    return {
      success: false,
      insufficient,
      products,
    };
  }

  const quantities = new Map(
    orderItems.map((item) => [item.id, Number(item.quantity) || 0])
  );

  const nextProducts = products.map((product) => {
    const orderedQuantity = quantities.get(product.id) || 0;

    if (!orderedQuantity) return product;

    const nextStock = Math.max(0, (Number(product.stock) || 0) - orderedQuantity);

    return {
      ...product,
      stock: nextStock,
      status: getStockStatus(nextStock),
    };
  });

  saveAdminProducts(nextProducts);

  return {
    success: true,
    products: nextProducts,
  };
}
