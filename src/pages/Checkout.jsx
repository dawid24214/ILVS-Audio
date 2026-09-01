import { useState } from 'react';
import { CheckCircle, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Page.css';

function Checkout() {
  const [step, setStep] = useState(1);
  const [accepted, setAccepted] = useState(false);
  const [complete, setComplete] = useState(false);
  const { items, subtotal, clearCart } = useCart();
  const shipping = subtotal >= 500 ? 0 : 9.99;

  const placeOrder = () => { if (!accepted) return; setComplete(true); clearCart(); };
  if (complete) return <section className="page-section container success"><CheckCircle /><h1>ZAMÓWIENIE ZŁOŻONE!</h1><p>Dziękujemy za zakupy w ILVS Audio.</p></section>;

  return <section className="page-section container"><header className="page-header page-header--left"><span className="eyebrow">KASA</span><h1>KASA <span>→</span> ZAMÓWIENIE</h1></header><div className="checkout-layout"><div className="checkout-main"><div className="steps">{[1,2,3].map((n)=><div key={n} className={step===n?'step step--active':step>n?'step step--done':'step'}>{n}</div>)}</div>{step===1&&<div className="panel"><h2><Truck /> Dane dostawy</h2><form className="form-grid" onSubmit={(e)=>{e.preventDefault();setStep(2)}}><input required placeholder="Imię"/><input required placeholder="Nazwisko"/><input className="span-2" type="email" required placeholder="Email"/><input className="span-2" required placeholder="Ulica i numer"/><input required placeholder="Kod pocztowy"/><input required placeholder="Miasto"/><button className="button button--primary span-2">Dalej → płatność</button></form></div>}{step===2&&<div className="panel"><h2><CreditCard /> Metoda płatności</h2><label className="option"><input type="radio" defaultChecked name="pay"/> BLIK</label><label className="option"><input type="radio" name="pay"/> Karta płatnicza</label><label className="option"><input type="radio" name="pay"/> PayPal</label><div className="button-row"><button className="button button--ghost" onClick={()=>setStep(1)}>Wróć</button><button className="button button--primary" onClick={()=>setStep(3)}>Podsumowanie</button></div></div>}{step===3&&<div className="panel"><h2><CheckCircle /> Podsumowanie</h2>{items.map(i=><div className="summary-line" key={i.id}><span>{i.name} × {i.quantity}</span><strong>{(i.price*i.quantity).toLocaleString('pl-PL')} zł</strong></div>)}<label className="terms"><input type="checkbox" checked={accepted} onChange={(e)=>setAccepted(e.target.checked)}/> Akceptuję regulamin i politykę prywatności.</label><div className="button-row"><button className="button button--ghost" onClick={()=>setStep(2)}>Wróć</button><button disabled={!accepted||!items.length} className="button button--primary" onClick={placeOrder}>Zamów z płatnością</button></div></div>}</div><aside className="order-panel panel"><h2>Twoje zamówienie</h2>{items.length ? items.map(i=><div className="summary-line" key={i.id}><span>{i.name} × {i.quantity}</span><strong>{(i.price*i.quantity).toLocaleString('pl-PL')} zł</strong></div>) : <p>Koszyk jest pusty.</p>}<hr/><div className="summary-line"><span>Dostawa</span><strong>{shipping ? `${shipping.toFixed(2)} zł` : 'Darmowa'}</strong></div><div className="summary-line summary-line--total"><span>Razem</span><strong>{(subtotal+shipping).toLocaleString('pl-PL')} zł</strong></div></aside></div></section>;
}
export default Checkout;
