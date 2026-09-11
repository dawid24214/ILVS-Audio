import { useEffect, useState } from 'react';
import { Banknote, Box, Check, CheckCircle, CreditCard, Landmark, MapPin, PackageCheck, ShieldCheck, Smartphone, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { addOrder } from '../admin/utils/orderStorage';
import { reduceProductStock } from '../admin/utils/productStorage';
import { getSettings } from '../admin/utils/settingsStorage';
import { getActiveDeliveryMethods } from '../admin/utils/deliveryStorage';
import { getCurrentCustomer, updateCurrentCustomer } from '../utils/customerAuth';
import './Page.css';

const initialCustomer = {
  firstName: '',
  lastName: '',
  email: '',
  street: '',
  postalCode: '',
  city: '',
};

const paymentMethods = [
  {
    id: 'BLIK',
    title: 'BLIK',
    description: 'Szybka płatność kodem BLIK z aplikacji bankowej.',
    icon: Smartphone,
    badge: 'Najczęściej wybierane',
  },
  {
    id: 'Karta płatnicza',
    title: 'Karta płatnicza',
    description: 'Visa, Mastercard i inne popularne karty płatnicze.',
    icon: CreditCard,
    badge: 'Bezpieczna płatność',
  },
  {
    id: 'PayPal',
    title: 'PayPal',
    description: 'Zapłać przez swoje konto PayPal.',
    icon: Landmark,
    badge: 'Online',
  },
];

function Checkout() {
  const [step, setStep] = useState(1);
  const [accepted, setAccepted] = useState(false);
  const [complete, setComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customer, setCustomer] = useState(() => {
    const account = getCurrentCustomer();
    return account
      ? {
          firstName: account.firstName || '',
          lastName: account.lastName || '',
          email: account.email || '',
          street: account.street || '',
          postalCode: account.postalCode || '',
          city: account.city || '',
        }
      : initialCustomer;
  });
  const [payment, setPayment] = useState('BLIK');
  const [deliveryMethods, setDeliveryMethods] = useState(() => getActiveDeliveryMethods());
  const [deliveryMethodId, setDeliveryMethodId] = useState(() => getActiveDeliveryMethods()[0]?.id || '');
  const [stockError, setStockError] = useState('');
  const [settings, setSettings] = useState(() => getSettings());
  const { items, subtotal, clearCart } = useCart();

  useEffect(() => {
    const refreshSettings = () => setSettings(getSettings());
    const refreshDeliveryMethods = () => {
      const activeMethods = getActiveDeliveryMethods();
      setDeliveryMethods(activeMethods);
      setDeliveryMethodId((current) =>
        activeMethods.some((method) => method.id === current)
          ? current
          : activeMethods[0]?.id || ''
      );
    };

    const handleStorage = (event) => {
      if (event.key === 'ilvs_store_settings') refreshSettings();
      if (event.key === 'ilvs_delivery_methods') refreshDeliveryMethods();
    };

    window.addEventListener('ilvs:settings-updated', refreshSettings);
    window.addEventListener('ilvs:delivery-methods-updated', refreshDeliveryMethods);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('ilvs:settings-updated', refreshSettings);
      window.removeEventListener('ilvs:delivery-methods-updated', refreshDeliveryMethods);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const selectedDeliveryMethod =
    deliveryMethods.find((method) => method.id === deliveryMethodId) || null;

  const baseShipping = Number(selectedDeliveryMethod?.price || 0);
  const freeShippingThreshold = Number(settings.freeShippingFrom || 0);
  const shipping =
    selectedDeliveryMethod &&
    freeShippingThreshold > 0 &&
    subtotal >= freeShippingThreshold
      ? 0
      : baseShipping;
  const total = subtotal + shipping;
  const currencySuffix = settings.currency === 'EUR' ? '€' : 'zł';

  const updateCustomer = (event) => {
    const { name, value } = event.target;
    setCustomer((current) => ({ ...current, [name]: value }));
  };

  const placeOrder = () => {
    if (!accepted || !items.length) return;

    if (!selectedDeliveryMethod) {
      setStockError('Wybierz aktywną metodę dostawy.');
      setStep(1);
      return;
    }

    if (!settings.activeSales) {
      setStockError('Sprzedaż jest obecnie wyłączona przez administratora sklepu.');
      return;
    }

    setStockError('');

    const stockResult = reduceProductStock(items);

    if (!stockResult.success) {
      const message = stockResult.insufficient
        .map((item) => `${item.name}: dostępne ${item.available} szt., w koszyku ${item.requested} szt.`)
        .join(' • ');

      setStockError(`Nie można złożyć zamówienia. Zmienił się stan magazynowy. ${message}`);
      return;
    }

    const number = `ILVS-${Date.now().toString().slice(-8)}`;
    const order = {
      id: `order-${Date.now()}`,
      number,
      createdAt: new Date().toISOString(),
      customer: { ...customer },
      payment,
      deliveryMethod: {
        id: selectedDeliveryMethod.id,
        name: selectedDeliveryMethod.name,
        description: selectedDeliveryMethod.description,
        eta: selectedDeliveryMethod.eta,
        basePrice: Number(selectedDeliveryMethod.price),
        chargedPrice: shipping,
      },
      currency: settings.currency,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image || '',
      })),
      subtotal,
      shipping,
      total,
      status: 'Nowe',
      paymentStatus: 'Oczekuje',
    };

    addOrder(order);

    const loggedCustomer = getCurrentCustomer();
    if (
      loggedCustomer &&
      loggedCustomer.email.trim().toLowerCase() === customer.email.trim().toLowerCase()
    ) {
      updateCurrentCustomer({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        street: customer.street,
        postalCode: customer.postalCode,
        city: customer.city,
      });
    }

    setOrderNumber(number);
    setComplete(true);
    clearCart();
  };

  if (complete) {
    return (
      <section className="page-section container success">
        <CheckCircle />
        <h1>ZAMÓWIENIE ZŁOŻONE!</h1>
        <p>Dziękujemy za zakupy w {settings.storeName}.</p>
        <strong>Numer zamówienia: {orderNumber}</strong>
      </section>
    );
  }

  return (
    <section className="page-section container">
      <header className="page-header page-header--left">
        <span className="eyebrow">KASA</span>
        <h1>KASA <span>→</span> ZAMÓWIENIE</h1>
      </header>

      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="steps">
            {[1, 2, 3].map((n) => (
              <div key={n} className={step === n ? 'step step--active' : step > n ? 'step step--done' : 'step'}>
                {n}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="panel checkout-delivery-panel">
              <div className="checkout-delivery-panel__heading">
                <div>
                  <span className="checkout-delivery-panel__eyebrow">KROK 1 Z 3</span>
                  <h2><Truck /> Dane i metoda dostawy</h2>
                  <p>Podaj adres oraz wybierz sposób dostarczenia zamówienia.</p>
                </div>
                <div className="checkout-delivery-panel__badge">
                  <PackageCheck />
                  <span>Metody z panelu admina</span>
                </div>
              </div>

              <form
                className="checkout-delivery-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedDeliveryMethod) return;
                  setStep(2);
                }}
              >
                <div className="form-grid">
                  <input name="firstName" value={customer.firstName} onChange={updateCustomer} required placeholder="Imię" />
                  <input name="lastName" value={customer.lastName} onChange={updateCustomer} required placeholder="Nazwisko" />
                  <input name="email" value={customer.email} onChange={updateCustomer} className="span-2" type="email" required placeholder="Email" />
                  <input name="street" value={customer.street} onChange={updateCustomer} className="span-2" required placeholder="Ulica i numer" />
                  <input name="postalCode" value={customer.postalCode} onChange={updateCustomer} required placeholder="Kod pocztowy" />
                  <input name="city" value={customer.city} onChange={updateCustomer} required placeholder="Miasto" />
                </div>

                <div className="checkout-delivery-method-section">
                  <div className="checkout-delivery-method-section__title">
                    <MapPin />
                    <div>
                      <strong>Wybierz metodę dostawy</strong>
                      <span>Koszt zostanie doliczony do podsumowania.</span>
                    </div>
                  </div>

                  {deliveryMethods.length > 0 ? (
                    <div className="delivery-methods">
                      {deliveryMethods.map((method) => {
                        const active = deliveryMethodId === method.id;
                        const methodPrice =
                          freeShippingThreshold > 0 &&
                          subtotal >= freeShippingThreshold
                            ? 0
                            : Number(method.price);

                        return (
                          <label
                            key={method.id}
                            className={`delivery-method${
                              active ? ' delivery-method--active' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryMethod"
                              checked={active}
                              onChange={() => setDeliveryMethodId(method.id)}
                            />

                            <span className="delivery-method__icon">
                              {Number(method.price) === 0 ? <Box /> : <Truck />}
                            </span>

                            <span className="delivery-method__content">
                              <span className="delivery-method__title">
                                <strong>{method.name}</strong>
                                <b>
                                  {methodPrice === 0
                                    ? 'Darmowa'
                                    : `${methodPrice.toFixed(2)} ${currencySuffix}`}
                                </b>
                              </span>
                              <span className="delivery-method__description">
                                {method.description || 'Metoda dostawy ILVS Audio'}
                              </span>
                              {method.eta && (
                                <span className="delivery-method__eta">
                                  Przewidywany czas: {method.eta}
                                </span>
                              )}
                            </span>

                            <span className="delivery-method__check">
                              {active && <Check />}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="checkout-delivery-empty">
                      <strong>Brak aktywnych metod dostawy</strong>
                      <p>
                        Administrator musi włączyć co najmniej jedną metodę
                        dostawy.
                      </p>
                    </div>
                  )}

                  {freeShippingThreshold > 0 && (
                    <div className="checkout-delivery-free-info">
                      <PackageCheck />
                      <span>
                        Darmowa dostawa dla zamówień od{' '}
                        <strong>
                          {freeShippingThreshold.toLocaleString('pl-PL')}{' '}
                          {currencySuffix}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                <button
                  className="button button--primary"
                  disabled={!selectedDeliveryMethod}
                >
                  Dalej → płatność
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="panel checkout-payment-panel">
              <div className="checkout-payment-panel__heading">
                <div>
                  <span className="checkout-payment-panel__eyebrow">KROK 2 Z 3</span>
                  <h2><CreditCard /> Metoda płatności</h2>
                  <p>Wybierz sposób, w jaki chcesz opłacić zamówienie.</p>
                </div>
                <div className="checkout-payment-panel__secure">
                  <ShieldCheck />
                  <span>Bezpieczna płatność</span>
                </div>
              </div>

              <div className="payment-methods">
                {paymentMethods.map(({ id, title, description, icon: Icon, badge }) => {
                  const active = payment === id;

                  return (
                    <label
                      className={`payment-method${active ? ' payment-method--active' : ''}`}
                      key={id}
                    >
                      <input
                        className="payment-method__radio"
                        type="radio"
                        name="pay"
                        checked={active}
                        onChange={() => setPayment(id)}
                      />

                      <span className="payment-method__icon">
                        <Icon />
                      </span>

                      <span className="payment-method__content">
                        <span className="payment-method__topline">
                          <strong>{title}</strong>
                          <small>{badge}</small>
                        </span>
                        <span className="payment-method__description">
                          {description}
                        </span>
                      </span>

                      <span className="payment-method__check" aria-hidden="true">
                        {active && <Check />}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="checkout-payment-info">
                <Banknote />
                <div>
                  <strong>Do zapłaty: {total.toLocaleString('pl-PL')} {currencySuffix}</strong>
                  <span>Wybrana metoda: {payment}</span>
                </div>
              </div>

              <div className="button-row checkout-payment-actions">
                <button className="button button--ghost" onClick={() => setStep(1)}>
                  Wróć
                </button>
                <button className="button button--primary" onClick={() => setStep(3)}>
                  Dalej → podsumowanie
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="panel">
              <h2><CheckCircle /> Podsumowanie</h2>
              <div className="checkout-customer-summary">
                <strong>{customer.firstName} {customer.lastName}</strong>
                <span>{customer.email}</span>
                <span>{customer.street}, {customer.postalCode} {customer.city}</span>
                <span>
                  Dostawa: {selectedDeliveryMethod?.name || '—'}
                  {selectedDeliveryMethod?.eta ? ` • ${selectedDeliveryMethod.eta}` : ''}
                </span>
                <span>Płatność: {payment}</span>
              </div>
              {items.map((item) => (
                <div className="summary-line" key={item.id}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>{(item.price * item.quantity).toLocaleString('pl-PL')} {currencySuffix}</strong>
                </div>
              ))}
              {stockError && (
                <div className="checkout-stock-error" role="alert">
                  {stockError}
                </div>
              )}

              <label className="terms">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                Akceptuję regulamin i politykę prywatności.
              </label>
              <div className="button-row">
                <button className="button button--ghost" onClick={() => setStep(2)}>Wróć</button>
                <button disabled={!accepted || !items.length || !settings.activeSales} className="button button--primary" onClick={placeOrder}>
                  {settings.activeSales ? 'Zamów z płatnością' : 'Sprzedaż wyłączona'}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="order-panel panel">
          <h2>Twoje zamówienie</h2>
          {items.length ? items.map((item) => (
            <div className="summary-line" key={item.id}>
              <span>{item.name} × {item.quantity}</span>
              <strong>{(item.price * item.quantity).toLocaleString('pl-PL')} {currencySuffix}</strong>
            </div>
          )) : <p>Koszyk jest pusty.</p>}
          <hr />
          <div className="summary-line">
            <span>
              Dostawa
              {selectedDeliveryMethod && (
                <small className="summary-line__detail">
                  {selectedDeliveryMethod.name}
                </small>
              )}
            </span>
            <strong>{shipping ? `${shipping.toFixed(2)} ${currencySuffix}` : 'Darmowa'}</strong>
          </div>
          <div className="summary-line summary-line--total">
            <span>Razem</span>
            <strong>{total.toLocaleString('pl-PL')} {currencySuffix}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
