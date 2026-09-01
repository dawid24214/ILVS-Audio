import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const { addItem } = useCart();
  return (
    <article className="product-card">
      <div className="product-card__media">
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
        <button className={`product-card__like ${liked ? 'product-card__like--active' : ''}`} onClick={() => setLiked(!liked)} aria-label="Dodaj do ulubionych"><Heart /></button>
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-card__content">
        <div className="product-card__rating"><Star fill="currentColor" /> {product.rating}</div>
        <span className="product-card__category">{product.category}</span>
        <h3>{product.name}</h3>
        <div className="product-card__bottom"><div><strong>{product.price.toLocaleString('pl-PL')} zł</strong>{product.oldPrice && <del>{product.oldPrice.toLocaleString('pl-PL')} zł</del>}</div><button className="product-card__cart" onClick={() => addItem(product)}><ShoppingCart /></button></div>
      </div>
    </article>
  );
}
export default ProductCard;
