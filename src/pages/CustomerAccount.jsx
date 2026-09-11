import { useEffect, useMemo, useState } from "react";
import {
  LogIn,
  LogOut,
  MapPin,
  Package,
  Save,
  ShieldCheck,
  UserRound,
  UserPlus,
} from "lucide-react";
import {
  clearCustomerSession,
  getCurrentCustomer,
  loginCustomer,
  registerCustomer,
  updateCurrentCustomer,
} from "../utils/customerAuth";
import { getOrders } from "../admin/utils/orderStorage";
import { getSettings } from "../admin/utils/settingsStorage";
import "./CustomerAccount.css";

const money = (value, currency) =>
  `${Number(value || 0).toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency === "EUR" ? "€" : "zł"}`;

const formatDate = (value) =>
  new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const statusClass = (status) => {
  if (status === "Wysłane") return "customer-status customer-status--green";
  if (status === "W trakcie realizacji") return "customer-status customer-status--orange";
  if (status === "Wstrzymane") return "customer-status customer-status--yellow";
  if (status === "Anulowane") return "customer-status customer-status--red";
  return "customer-status customer-status--blue";
};

export default function CustomerAccount() {
  const [customer, setCustomer] = useState(() => getCurrentCustomer());
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [profile, setProfile] = useState(() => ({
    firstName: customer?.firstName || "",
    lastName: customer?.lastName || "",
    email: customer?.email || "",
    street: customer?.street || "",
    postalCode: customer?.postalCode || "",
    city: customer?.city || "",
  }));
  const [orders, setOrders] = useState(() => getOrders());
  const [settings, setSettings] = useState(() => getSettings());
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const syncCustomer = () => {
    const next = getCurrentCustomer();
    setCustomer(next);
    if (next) {
      setProfile({
        firstName: next.firstName || "",
        lastName: next.lastName || "",
        email: next.email || "",
        street: next.street || "",
        postalCode: next.postalCode || "",
        city: next.city || "",
      });
    }
  };

  useEffect(() => {
    const refreshOrders = () => setOrders(getOrders());
    const refreshSettings = () => setSettings(getSettings());

    window.addEventListener("ilvs:orders-updated", refreshOrders);
    window.addEventListener("ilvs:customer-auth-changed", syncCustomer);
    window.addEventListener("ilvs:customer-accounts-updated", syncCustomer);
    window.addEventListener("ilvs:settings-updated", refreshSettings);
    window.addEventListener("storage", refreshOrders);

    return () => {
      window.removeEventListener("ilvs:orders-updated", refreshOrders);
      window.removeEventListener("ilvs:customer-auth-changed", syncCustomer);
      window.removeEventListener("ilvs:customer-accounts-updated", syncCustomer);
      window.removeEventListener("ilvs:settings-updated", refreshSettings);
      window.removeEventListener("storage", refreshOrders);
    };
  }, []);

  const customerOrders = useMemo(() => {
    if (!customer?.email) return [];

    const email = customer.email.trim().toLowerCase();
    return orders
      .filter(
        (order) =>
          String(order.customer?.email || "").trim().toLowerCase() === email
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, customer]);

  const totalSpent = customerOrders
    .filter((order) => order.status !== "Anulowane")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const updateAuth = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (mode === "register") {
      if (authForm.password !== authForm.confirmPassword) {
        setError("Hasła nie są takie same.");
        return;
      }

      const result = await registerCustomer(authForm);
      if (!result.success) {
        setError(result.error);
        return;
      }

      syncCustomer();
      setMessage("Konto zostało utworzone. Witaj w ILVS Audio! ✓");
      return;
    }

    const result = await loginCustomer(authForm.email, authForm.password);
    if (!result.success) {
      setError(result.error);
      return;
    }

    syncCustomer();
    setMessage("Zalogowano pomyślnie. ✓");
  };

  const handleProfileSave = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const updated = updateCurrentCustomer({
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      email: profile.email.trim().toLowerCase(),
      street: profile.street.trim(),
      postalCode: profile.postalCode.trim(),
      city: profile.city.trim(),
    });

    if (!updated) {
      setError("Nie udało się zapisać danych.");
      return;
    }

    syncCustomer();
    setMessage("Dane konta zostały zapisane. ✓");
  };

  const logout = () => {
    clearCustomerSession();
    setCustomer(null);
    setSelectedOrder(null);
    setMessage("");
    setError("");
    setAuthForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  if (!customer) {
    return (
      <section className="customer-account-page container">
        <div className="customer-auth">
          <div className="customer-auth__intro">
            <span className="eyebrow">KONTO KLIENTA</span>
            <h1>
              TWOJE KONTO <span>ILVS</span>
            </h1>
            <p>
              Zaloguj się, aby sprawdzać status zamówień, historię zakupów i
              zapisane dane dostawy.
            </p>

            <div className="customer-auth__benefits">
              <div><Package /><span>Historia i status zamówień</span></div>
              <div><MapPin /><span>Zapisany adres dostawy</span></div>
              <div><ShieldCheck /><span>Oddzielna sesja klienta</span></div>
            </div>
          </div>

          <div className="customer-auth__card">
            <div className="customer-auth__tabs">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                type="button"
              >
                Logowanie
              </button>
              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                type="button"
              >
                Rejestracja
              </button>
            </div>

            <form onSubmit={handleAuth}>
              {error && <div className="customer-account__error">{error}</div>}

              {mode === "register" && (
                <div className="customer-auth__name-grid">
                  <label>
                    <span>Imię</span>
                    <input
                      name="firstName"
                      value={authForm.firstName}
                      onChange={updateAuth}
                      required
                    />
                  </label>
                  <label>
                    <span>Nazwisko</span>
                    <input
                      name="lastName"
                      value={authForm.lastName}
                      onChange={updateAuth}
                      required
                    />
                  </label>
                </div>
              )}

              <label>
                <span>Adres e-mail</span>
                <input
                  name="email"
                  type="email"
                  value={authForm.email}
                  onChange={updateAuth}
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                <span>Hasło</span>
                <input
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={updateAuth}
                  required
                  minLength="6"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </label>

              {mode === "register" && (
                <label>
                  <span>Powtórz hasło</span>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={updateAuth}
                    required
                    minLength="6"
                    autoComplete="new-password"
                  />
                </label>
              )}

              <button className="button button--primary button--full" type="submit">
                {mode === "login" ? <LogIn /> : <UserPlus />}
                {mode === "login" ? "Zaloguj się" : "Utwórz konto"}
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="customer-account-page container">
      <header className="customer-dashboard__header">
        <div>
          <span className="eyebrow">KONTO KLIENTA</span>
          <h1>
            CZEŚĆ, <span>{customer.firstName || "KLIENCIE"}</span>
          </h1>
          <p>{customer.email}</p>
        </div>

        <button className="button button--ghost" type="button" onClick={logout}>
          <LogOut />
          Wyloguj
        </button>
      </header>

      {message && <div className="customer-account__success">{message}</div>}
      {error && <div className="customer-account__error">{error}</div>}

      <div className="customer-dashboard__stats">
        <article>
          <span>Zamówienia</span>
          <strong>{customerOrders.length}</strong>
        </article>
        <article>
          <span>Łączna wartość</span>
          <strong>{money(totalSpent, settings.currency)}</strong>
        </article>
        <article>
          <span>Ostatnie zamówienie</span>
          <strong>
            {customerOrders[0] ? customerOrders[0].number : "—"}
          </strong>
        </article>
      </div>

      <div className="customer-dashboard__layout">
        <div>
          <article className="panel customer-profile-card">
            <h2><UserRound /> Moje dane</h2>

            <form className="customer-profile-form" onSubmit={handleProfileSave}>
              <div className="customer-profile-form__grid">
                <label>
                  <span>Imię</span>
                  <input
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile((current) => ({
                        ...current,
                        firstName: e.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>Nazwisko</span>
                  <input
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile((current) => ({
                        ...current,
                        lastName: e.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="customer-profile-form__full">
                  <span>E-mail</span>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((current) => ({
                        ...current,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="customer-profile-form__full">
                  <span>Ulica i numer</span>
                  <input
                    value={profile.street}
                    onChange={(e) =>
                      setProfile((current) => ({
                        ...current,
                        street: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Kod pocztowy</span>
                  <input
                    value={profile.postalCode}
                    onChange={(e) =>
                      setProfile((current) => ({
                        ...current,
                        postalCode: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Miasto</span>
                  <input
                    value={profile.city}
                    onChange={(e) =>
                      setProfile((current) => ({
                        ...current,
                        city: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <button className="button button--primary" type="submit">
                <Save />
                Zapisz dane
              </button>
            </form>
          </article>
        </div>

        <article className="panel customer-orders-card">
          <h2><Package /> Moje zamówienia</h2>

          {customerOrders.length === 0 ? (
            <div className="customer-orders-empty">
              <strong>Nie masz jeszcze zamówień</strong>
              <p>
                Zamówienia złożone na adres {customer.email} pojawią się tutaj
                automatycznie.
              </p>
            </div>
          ) : (
            <div className="customer-orders-list">
              {customerOrders.map((order) => (
                <button
                  className="customer-order-row"
                  type="button"
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div>
                    <strong>{order.number}</strong>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div>
                    <strong>{money(order.total, settings.currency)}</strong>
                    <span className={statusClass(order.status)}>
                      {order.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </article>
      </div>

      {selectedOrder && (
        <div
          className="customer-order-modal"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="customer-order-modal__content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="customer-order-modal__header">
              <div>
                <span>ZAMÓWIENIE</span>
                <h2>{selectedOrder.number}</h2>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="customer-order-modal__meta">
              <div>
                <span>Status</span>
                <strong className={statusClass(selectedOrder.status)}>
                  {selectedOrder.status}
                </strong>
              </div>
              <div>
                <span>Data</span>
                <strong>{formatDate(selectedOrder.createdAt)}</strong>
              </div>
              <div>
                <span>Płatność</span>
                <strong>{selectedOrder.payment}</strong>
              </div>
              <div>
                <span>Dostawa</span>
                <strong>{selectedOrder.deliveryMethod?.name || "—"}</strong>
              </div>
            </div>

            <h3>Produkty</h3>
            <div className="customer-order-modal__products">
              {selectedOrder.items?.map((item) => (
                <div key={`${selectedOrder.id}-${item.id}`}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>
                    {money(Number(item.price) * Number(item.quantity), settings.currency)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="customer-order-modal__total">
              <span>Razem</span>
              <strong>{money(selectedOrder.total, settings.currency)}</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
