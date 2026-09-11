const ADMIN_STORAGE_KEY = "ilvs_admin_products";
const CATEGORY_STORAGE_KEY = "ilvs_categories";

function normalizeAdminProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: Number(product.price) || 0,
    oldPrice: null,
    rating: 5,
    image: product.image || "",
    badge: "NOWOŚĆ",
    stock: Number(product.stock) || 0,
    description: product.description || "",
    isAdminProduct: true,
    createdAt: product.createdAt || "",
  };
}

export function getStoreProducts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeAdminProduct);
  } catch {
    return [];
  }
}

export function getStoreCategories(products = []) {
  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY) || "null");
      if (Array.isArray(stored)) {
        const categories = stored
          .map((item) => typeof item === "string" ? item.trim() : "")
          .filter(Boolean);

        return ["Wszystkie", ...new Set(categories)];
      }
    } catch {
      // Fall back to product categories.
    }
  }

  return [
    "Wszystkie",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];
}
