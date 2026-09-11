import {
  getAdminProducts,
  saveAdminProducts,
} from "./productStorage";

const STORAGE_KEY = "ilvs_categories";

const DEFAULT_CATEGORIES = [
  "Kontrolery DJ",
  "Miksery",
  "Słuchawki",
  "Głośniki",
  "Akcesoria",
];

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function uniqueNames(names) {
  const seen = new Set();

  return names.filter((name) => {
    const normalized = normalizeName(name);
    const key = normalized.toLocaleLowerCase("pl");

    if (!normalized || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getCategories() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (Array.isArray(stored)) {
      return uniqueNames(stored.map((category) =>
        typeof category === "string" ? category : category?.name
      ));
    }
  } catch {
    // fall through to initial categories
  }

  const productCategories = getAdminProducts()
    .map((product) => product.category)
    .filter(Boolean);

  const initial = uniqueNames([...productCategories, ...DEFAULT_CATEGORIES]);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveCategories(categories) {
  const next = uniqueNames(categories.map(normalizeName));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("ilvs:categories-updated"));
  return next;
}

export function addCategory(name) {
  const normalized = normalizeName(name);
  if (!normalized) {
    return { success: false, error: "Podaj nazwę kategorii." };
  }

  const categories = getCategories();
  const exists = categories.some(
    (category) =>
      category.toLocaleLowerCase("pl") === normalized.toLocaleLowerCase("pl")
  );

  if (exists) {
    return { success: false, error: "Taka kategoria już istnieje." };
  }

  const next = saveCategories([...categories, normalized]);
  return { success: true, categories: next, name: normalized };
}

export function renameCategory(oldName, newName) {
  const oldNormalized = normalizeName(oldName);
  const newNormalized = normalizeName(newName);

  if (!newNormalized) {
    return { success: false, error: "Podaj nową nazwę kategorii." };
  }

  const categories = getCategories();
  const duplicate = categories.some(
    (category) =>
      category.toLocaleLowerCase("pl") === newNormalized.toLocaleLowerCase("pl") &&
      category.toLocaleLowerCase("pl") !== oldNormalized.toLocaleLowerCase("pl")
  );

  if (duplicate) {
    return { success: false, error: "Taka kategoria już istnieje." };
  }

  const nextCategories = categories.map((category) =>
    category === oldName ? newNormalized : category
  );

  const products = getAdminProducts();
  const nextProducts = products.map((product) =>
    product.category === oldName
      ? { ...product, category: newNormalized, updatedAt: new Date().toISOString() }
      : product
  );

  saveAdminProducts(nextProducts);
  saveCategories(nextCategories);

  return {
    success: true,
    categories: nextCategories,
    name: newNormalized,
  };
}

export function removeCategory(name) {
  const products = getAdminProducts();
  const assignedProducts = products.filter(
    (product) => product.category === name
  );

  if (assignedProducts.length > 0) {
    return {
      success: false,
      error: `Nie można usunąć kategorii. Jest przypisana do ${assignedProducts.length} ${
        assignedProducts.length === 1 ? "produktu" : "produktów"
      }.`,
    };
  }

  const next = getCategories().filter((category) => category !== name);
  saveCategories(next);
  return { success: true, categories: next };
}

export function getCategoryProductCount(name) {
  return getAdminProducts().filter((product) => product.category === name).length;
}
