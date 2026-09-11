import { useEffect, useMemo, useState } from "react";
import {
  addCategory,
  getCategories,
  removeCategory,
  renameCategory,
} from "../utils/categoryStorage";
import { getAdminProducts } from "../utils/productStorage";
import "./AdminPages.css";

export default function AdminCategories() {
  const [categories, setCategories] = useState(() => getCategories());
  const [products, setProducts] = useState(() => getAdminProducts());
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = () => {
    setCategories(getCategories());
    setProducts(getAdminProducts());
  };

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key === "ilvs_categories" ||
        event.key === "ilvs_admin_products"
      ) {
        refresh();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("ilvs:categories-updated", refresh);
    window.addEventListener("ilvs:products-updated", refresh);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("ilvs:categories-updated", refresh);
      window.removeEventListener("ilvs:products-updated", refresh);
    };
  }, []);

  const categoryData = useMemo(
    () =>
      categories.map((name) => ({
        name,
        count: products.filter((product) => product.category === name).length,
      })),
    [categories, products]
  );

  const handleAdd = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const result = addCategory(newCategory);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setCategories(result.categories);
    setNewCategory("");
    setMessage(`Dodano kategorię „${result.name}”.`);
  };

  const startEdit = (name) => {
    setEditing(name);
    setEditName(name);
    setError("");
    setMessage("");
  };

  const handleRename = (event) => {
    event.preventDefault();
    if (!editing) return;

    const result = renameCategory(editing, editName);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setEditing(null);
    setEditName("");
    refresh();
    setMessage(
      `Kategoria została zmieniona na „${result.name}”. Produkty zostały zaktualizowane automatycznie.`
    );
  };

  const handleDelete = (name) => {
    setError("");
    setMessage("");

    const accepted = window.confirm(
      `Czy na pewno chcesz usunąć kategorię „${name}”?`
    );

    if (!accepted) return;

    const result = removeCategory(name);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setCategories(result.categories);
    setMessage(`Usunięto kategorię „${name}”.`);
  };

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-page__eyebrow">Katalog</p>
          <h1 className="admin-page__title">Kategorie</h1>
          <p className="admin-page__description">
            Kategorie są wspólne dla panelu administratora i sklepu. Zmiana nazwy
            automatycznie aktualizuje wszystkie przypisane produkty.
          </p>
        </div>
      </div>

      <form
        className="admin-page__panel admin-category-add"
        onSubmit={handleAdd}
      >
        <div>
          <span>NOWA KATEGORIA</span>
          <h2>Dodaj kategorię</h2>
        </div>

        <div className="admin-category-add__controls">
          <input
            type="text"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="np. Monitory studyjne"
          />
          <button
            className="admin-page__button"
            type="submit"
            disabled={!newCategory.trim()}
          >
            + Dodaj kategorię
          </button>
        </div>
      </form>

      {message && <div className="admin-page__success">{message}</div>}
      {error && (
        <div className="admin-product-form__message admin-product-form__message--error">
          {error}
        </div>
      )}

      {categoryData.length === 0 ? (
        <div className="admin-page__panel admin-orders-empty">
          <strong>Brak kategorii</strong>
          <p>Dodaj pierwszą kategorię, aby móc przypisywać do niej produkty.</p>
        </div>
      ) : (
        <div className="admin-page__grid">
          {categoryData.map((category) => (
            <article
              className="admin-page__panel admin-page__category"
              key={category.name}
            >
              {editing === category.name ? (
                <form
                  className="admin-category-edit"
                  onSubmit={handleRename}
                >
                  <span>EDYCJA KATEGORII</span>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    autoFocus
                  />
                  <div className="admin-page__actions">
                    <button
                      type="submit"
                      className="admin-page__icon-btn admin-page__icon-btn--accent"
                      disabled={!editName.trim()}
                    >
                      Zapisz
                    </button>
                    <button
                      type="button"
                      className="admin-page__icon-btn"
                      onClick={() => {
                        setEditing(null);
                        setEditName("");
                      }}
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3>{category.name}</h3>
                  <p>Kategoria produktów ILVS Audio</p>
                  <strong>
                    {category.count}{" "}
                    {category.count === 1 ? "produkt" : "produktów"}
                  </strong>

                  <div
                    className="admin-page__actions"
                    style={{ marginTop: 14 }}
                  >
                    <button
                      className="admin-page__icon-btn"
                      type="button"
                      onClick={() => startEdit(category.name)}
                    >
                      Edytuj
                    </button>
                    <button
                      className="admin-page__icon-btn admin-page__icon-btn--danger"
                      type="button"
                      onClick={() => handleDelete(category.name)}
                    >
                      Usuń
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
