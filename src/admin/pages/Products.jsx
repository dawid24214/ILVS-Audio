import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAdminProducts, removeAdminProduct } from "../utils/productStorage";
import "./AdminPages.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(price);

const getStockStatus = (stock) => {
  const quantity = Number(stock) || 0;
  if (quantity === 0) return "Brak na magazynie";
  if (quantity <= 5) return "Niski stan";
  return "Aktywny";
};

const badgeClass = (status) => {
  if (status === "Aktywny") return "admin-page__badge--green";
  if (status === "Brak na magazynie") return "admin-page__badge--red";
  return "admin-page__badge--orange";
};

export default function Products() {
  const location = useLocation();
  const [products, setProducts] = useState(() => getAdminProducts());
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter((product) =>
      `${product.name} ${product.category} ${product.status}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [products, query]);

  const activeCount = products.filter((product) => getStockStatus(product.stock) === "Aktywny").length;
  const lowStockCount = products.filter((product) => getStockStatus(product.stock) === "Niski stan").length;
  const unavailableCount = products.filter((product) => getStockStatus(product.stock) === "Brak na magazynie").length;

  const handleDelete = (product) => {
    const shouldDelete = window.confirm(`Usunąć produkt „${product.name}”?`);
    if (!shouldDelete) return;

    const nextProducts = removeAdminProduct(product.id);
    setProducts(nextProducts);
  };

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-page__eyebrow">Katalog</p>
          <h1 className="admin-page__title">Produkty</h1>
          <p className="admin-page__description">
            Produkty pojawiają się tutaj tylko po dodaniu ich przez panel administratora.
          </p>
        </div>

        <Link className="admin-page__button" to="/admin/produkty/dodaj">
          + Dodaj produkt
        </Link>
      </div>

      {location.state?.productAdded && (
        <div className="admin-page__success">
          Produkt <strong>{location.state.productName}</strong> został dodany. ✓
        </div>
      )}

      {location.state?.productUpdated && (
        <div className="admin-page__success">
          Produkt <strong>{location.state.productName}</strong> został zaktualizowany. ✓
        </div>
      )}

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <span>Wszystkie produkty</span>
          <strong>{products.length}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Aktywne</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Niski stan</span>
          <strong>{lowStockCount}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Brak na magazynie</span>
          <strong>{unavailableCount}</strong>
        </div>
      </div>

      <div className="admin-page__panel">
        <div className="admin-page__panel-header">
          <h2>Lista produktów</h2>
          <input
            className="admin-page__search"
            placeholder="Szukaj produktu..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="admin-page__table-wrap">
          <table className="admin-page__table">
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Kategoria</th>
                <th>Cena</th>
                <th>Stan</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-cell">
                      {product.image ? (
                        <img src={product.image} alt="" className="admin-product-cell__image" />
                      ) : (
                        <div className="admin-product-cell__placeholder">ILVS</div>
                      )}
                      <div>
                        <strong>{product.name}</strong>
                        <small>Dodany w panelu</small>
                      </div>
                    </div>
                  </td>
                  <td className="admin-page__muted">{product.category}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock} szt.</td>
                  <td>
                    <span className={`admin-page__badge ${badgeClass(getStockStatus(product.stock))}`}>
                      {getStockStatus(product.stock)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-page__actions">
                      <Link
                        className="admin-page__icon-btn"
                        to={`/admin/produkty/${product.id}/edytuj`}
                      >
                        Edytuj
                      </Link>
                      <button
                        className="admin-page__icon-btn"
                        type="button"
                        onClick={() => handleDelete(product)}
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="admin-page__empty">
                    Brak produktów. Dodaj pierwszy produkt przez panel administratora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
