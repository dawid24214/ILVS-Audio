import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getSettings } from '../../admin/utils/settingsStorage';
import './ProductCard.css';

function getStockStatus(stock) {
  const quantity = Number(stock) || 0;

  if (quantity === 0) {
    return {
      label: 'Brak na magazynie',
      className: 'product-card__stock--out',
    };
  }

  if (quantity <= 5) {
    return {
      label: `Niski stan: ${quantity} szt.`,
      className: 'product-card__stock--low',
    };
  }

  return {
    label: `Dostępny: ${quantity} szt.`,
    className: 'product-card__stock--available',
  };
}

function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const { addItem } = useCart();
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    const refresh = () => setSettings(getSettings());
    window.addEventListener('ilvs:settings-updated', refresh);
    return () => window.removeEventListener('ilvs:settings-updated', refresh);
  }, []);

  const stock = Number(product.stock) || 0;
  const stockStatus = getStockStatus(stock);
  const isOutOfStock = stock === 0;
  const salesBlocked = !settings.activeSales;
  const currencySuffix = settings.currency === 'EUR' ? '€' : 'zł';

  return (
    <article className="product-card">
      <div className="product-card__media">
        <Link
          className="product-card__details-link product-card__details-link--media"
          to={`/produkt/${product.id}`}
          aria-label={`Zobacz szczegóły produktu ${product.name}`}
        />
        {product.badge && <span className="product-card__badge">{product.badge}</span>}

        <button
          className={`product-card__like ${liked ? 'product-card__like--active' : ''}`}
          onClick={() => setLiked(!liked)}
          aria-label="Dodaj do ulubionych"
        >
          <Heart />
        </button>

        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="product-card__image-placeholder">ILVS AUDIO</div>
        )}
      </div>

      <div className="product-card__content">
        <div className="product-card__rating">
          <Star fill="currentColor" /> {product.rating ?? 5}
        </div>

        <span className="product-card__category">{product.category}</span>

        <h3>
          <Link className="product-card__title-link" to={`/produkt/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        {product.description && (
          <p className="product-card__description">{product.description}</p>
        )}

        {settings.showStock && (
          <div className={`product-card__stock ${stockStatus.className}`}>
            <span className="product-card__stock-dot" />
            {stockStatus.label}
          </div>
        )}

        <div className="product-card__bottom">
          <div>
            <strong>{product.price.toLocaleString('pl-PL')} {currencySuffix}</strong>
            {product.oldPrice && (
              <del>{product.oldPrice.toLocaleString('pl-PL')} {currencySuffix}</del>
            )}
          </div>

          <button
            className="product-card__cart"
            onClick={() => addItem(product)}
            disabled={isOutOfStock || salesBlocked}
            aria-label={
              salesBlocked
                ? 'Sprzedaż jest obecnie wyłączona'
                : isOutOfStock
                  ? 'Produkt niedostępny'
                  : `Dodaj ${product.name} do koszyka`
            }
            title={salesBlocked ? 'Sprzedaż wyłączona' : isOutOfStock ? 'Brak na magazynie' : 'Dodaj do koszyka'}
          >
            <ShoppingCart />
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
