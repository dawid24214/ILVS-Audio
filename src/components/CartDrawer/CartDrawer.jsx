import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

function CartDrawer() {
  const { items, subtotal, isCartOpen, setIsCartOpen, changeQuantity, removeItem } = useCart();
  return (
    <>
      <button aria-label="Zamknij koszyk" className={`cart-overlay ${isCartOpen ? 'cart-overlay--open' : ''}`} onClick={() => setIsCartOpen(false)} />
      <aside className={`cart-drawer ${isCartOpen ? 'cart-drawer--open' : ''}`} aria-label="Koszyk">
        <header className="cart-drawer__header"><div><ShoppingBag /> <strong>Koszyk</strong></div><button className="icon-button" onClick={() => setIsCartOpen(false)}><X /></button></header>
        <div className="cart-drawer__body">
          {items.length === 0 ? <div className="empty-cart"><ShoppingBag /><h3>Koszyk jest pusty</h3><p>Dodaj produkt, aby rozpocząć zakupy.</p></div> : items.map((item) => (
            <article className="cart-item" key={item.id}>
              <img src={item.image} alt="" />
              <div className="cart-item__info"><strong>{item.name}</strong><span>{item.price.toLocaleString('pl-PL')} zł</span></div>
              <div className="quantity"><button onClick={() => changeQuantity(item.id,-1)}><Minus /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id,1)}><Plus /></button></div>
              <button className="remove-button" onClick={() => removeItem(item.id)}><Trash2 /></button>
            </article>
          ))}
        </div>
        {items.length > 0 && <footer className="cart-drawer__footer"><div><span>Suma</span><strong>{subtotal.toLocaleString('pl-PL')} zł</strong></div><Link className="button button--primary button--full" to="/kasa" onClick={() => setIsCartOpen(false)}>Przejdź do kasy</Link></footer>}
      </aside>
    </>
  );
}
export default CartDrawer;
