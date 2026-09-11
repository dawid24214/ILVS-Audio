import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, ShoppingCart, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getStoreProducts } from "../data/storeProducts";
import { getSettings } from "../admin/utils/settingsStorage";
import "./ProductDetails.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(Number(price) || 0);

function getStockInfo(stock) {
  const quantity = Number(stock) || 0;

  if (quantity === 0) {
    return {
      label: "Brak na magazynie",
      className: "product-details__stock--out",
    };
  }

  if (quantity <= 5) {
    return {
      label: `Niski stan — zostało ${quantity} szt.`,
      className: "product-details__stock--low",
    };
  }

  return {
    label: `Dostępny — ${quantity} szt. na magazynie`,
    className: "product-details__stock--available",
  };
}

export default function ProductDetails() {
  const { productId } = useParams();
  const { addItem } = useCart();
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    const refresh = () => setSettings(getSettings());
    window.addEventListener("ilvs:settings-updated", refresh);
    return () => window.removeEventListener("ilvs:settings-updated", refresh);
  }, []);
  const product = getStoreProducts().find((item) => item.id === productId);

  if (!product) {
    return (
      <section className="page-section container product-details-missing">
        <h1>Nie znaleziono produktu</h1>
        <p>Produkt mógł zostać usunięty lub nie jest już dostępny.</p>
        <Link className="button button--primary" to="/kategorie">
          <ArrowLeft /> Wróć do produktów
        </Link>
      </section>
    );
  }

  const stock = Number(product.stock) || 0;
  const stockInfo = getStockInfo(stock);
  const isOutOfStock = stock === 0;
  const salesBlocked = !settings.activeSales;

  return (
    <section className="page-section container product-details">
      <Link className="product-details__back" to="/kategorie">
        <ArrowLeft /> Wróć do produktów
      </Link>

      <div className="product-details__layout">
        <div className="product-details__media">
          {product.badge && (
            <span className="product-details__badge">{product.badge}</span>
          )}

          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="product-details__placeholder">ILVS AUDIO</div>
          )}
        </div>

        <div className="product-details__info">
          <span className="product-details__category">{product.category}</span>
          <h1>{product.name}</h1>

          <div className="product-details__rating">
            <Star fill="currentColor" />
            <strong>{product.rating ?? 5}</strong>
          </div>

          <strong className="product-details__price">
            {settings.currency === "EUR"
              ? `${Number(product.price).toLocaleString("pl-PL")} €`
              : formatPrice(product.price)}
          </strong>

          {settings.showStock && (
            <div className={`product-details__stock ${stockInfo.className}`}>
              <span />
              {stockInfo.label}
            </div>
          )}

          <button
            className="button button--primary product-details__cart"
            type="button"
            disabled={isOutOfStock || salesBlocked}
            onClick={() => addItem(product)}
          >
            <ShoppingCart />
            {salesBlocked ? "Sprzedaż wyłączona" : isOutOfStock ? "Produkt niedostępny" : "Dodaj do koszyka"}
          </button>

          <div className="product-details__benefits">
            <span><CheckCircle /> Produkt z magazynu ILVS Audio</span>
            <span><CheckCircle /> Bezpieczne zakupy</span>
          </div>
        </div>
      </div>

      <div className="product-details__description">
        <span className="eyebrow">SZCZEGÓŁY PRODUKTU</span>
        <h2>Opis produktu</h2>
        {product.description ? (
          <p>{product.description}</p>
        ) : (
          <p className="product-details__description-empty">
            Brak dodatkowego opisu produktu.
          </p>
        )}
      </div>
    </section>
  );
}
