import { useEffect, useMemo, useState } from "react";
import {
  PackageCheck,
  Pencil,
  Plus,
  Power,
  Save,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  addDeliveryMethod,
  getDeliveryMethods,
  removeDeliveryMethod,
  toggleDeliveryMethod,
  updateDeliveryMethod,
} from "../utils/deliveryStorage";
import { getSettings } from "../utils/settingsStorage";
import "./AdminPages.css";

const emptyForm = {
  name: "",
  description: "",
  eta: "",
  price: "",
  active: true,
};

const money = (value, currency) =>
  `${Number(value || 0).toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency === "EUR" ? "€" : "zł"}`;

export default function DeliveryMethods() {
  const [methods, setMethods] = useState(() => getDeliveryMethods());
  const [settings, setSettings] = useState(() => getSettings());
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = () => setMethods(getDeliveryMethods());

  useEffect(() => {
    const refreshSettings = () => setSettings(getSettings());
    const handleStorage = (event) => {
      if (event.key === "ilvs_delivery_methods") refresh();
      if (event.key === "ilvs_store_settings") refreshSettings();
    };

    window.addEventListener("ilvs:delivery-methods-updated", refresh);
    window.addEventListener("ilvs:settings-updated", refreshSettings);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("ilvs:delivery-methods-updated", refresh);
      window.removeEventListener("ilvs:settings-updated", refreshSettings);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: methods.length,
      active: methods.filter((method) => method.active).length,
      free: methods.filter((method) => Number(method.price) === 0).length,
    }),
    [methods]
  );

  const updateNewField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMessage("");
    setError("");
  };

  const updateEditField = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = (values) => {
    if (!values.name.trim()) return "Podaj nazwę metody dostawy.";
    if (values.price === "" || Number(values.price) < 0) {
      return "Podaj poprawny koszt dostawy.";
    }
    return "";
  };

  const handleAdd = (event) => {
    event.preventDefault();
    const validationError = validate(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    const created = addDeliveryMethod(form);
    refresh();
    setForm(emptyForm);
    setMessage(`Dodano metodę dostawy: ${created.name}. ✓`);
    setError("");
  };

  const startEdit = (method) => {
    setEditingId(method.id);
    setEditForm({
      name: method.name,
      description: method.description,
      eta: method.eta,
      price: method.price,
      active: method.active,
    });
    setMessage("");
    setError("");
  };

  const saveEdit = (methodId) => {
    const validationError = validate(editForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    updateDeliveryMethod(methodId, editForm);
    refresh();
    setEditingId(null);
    setMessage("Metoda dostawy została zaktualizowana. ✓");
    setError("");
  };

  const handleToggle = (method) => {
    toggleDeliveryMethod(method.id);
    refresh();
    setMessage(
      method.active
        ? `Wyłączono metodę ${method.name}.`
        : `Włączono metodę ${method.name}. ✓`
    );
  };

  const handleDelete = (method) => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć metodę dostawy „${method.name}”?`
      )
    ) {
      return;
    }

    removeDeliveryMethod(method.id);
    refresh();
    setMessage(`Usunięto metodę ${method.name}.`);
  };

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-page__eyebrow">Checkout</p>
          <h1 className="admin-page__title">Metody dostawy</h1>
          <p className="admin-page__description">
            Zarządzaj opcjami dostawy widocznymi w Kasa → Dane dostawy.
            Aktywne metody pojawiają się klientowi automatycznie.
          </p>
        </div>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <span>Wszystkie</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Aktywne</span>
          <strong>{stats.active}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Darmowe</span>
          <strong>{stats.free}</strong>
        </div>
      </div>

      <form
        className="admin-page__panel admin-delivery-form"
        onSubmit={handleAdd}
      >
        <div className="admin-delivery-form__heading">
          <div>
            <span>NOWA METODA</span>
            <h2><Plus /> Dodaj metodę dostawy</h2>
          </div>
          <p>
            Próg darmowej dostawy z Ustawień sklepu nadal obowiązuje dla
            płatnych metod.
          </p>
        </div>

        {message && <div className="admin-page__success">{message}</div>}
        {error && (
          <div className="admin-product-form__message admin-product-form__message--error">
            {error}
          </div>
        )}

        <div className="admin-delivery-form__grid">
          <label className="admin-product-form__field">
            <span>Nazwa *</span>
            <input
              name="name"
              value={form.name}
              onChange={updateNewField}
              placeholder="np. Kurier Express"
              required
            />
          </label>

          <label className="admin-product-form__field">
            <span>Koszt *</span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={updateNewField}
              placeholder="19.99"
              required
            />
          </label>

          <label className="admin-product-form__field">
            <span>Przewidywany czas</span>
            <input
              name="eta"
              value={form.eta}
              onChange={updateNewField}
              placeholder="np. 1 dzień roboczy"
            />
          </label>

          <label className="admin-delivery-form__toggle">
            <input
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={updateNewField}
            />
            <span>Aktywna od razu</span>
          </label>

          <label className="admin-product-form__field admin-delivery-form__description">
            <span>Opis</span>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={updateNewField}
              placeholder="Krótka informacja wyświetlana klientowi..."
            />
          </label>
        </div>

        <button className="admin-page__button" type="submit">
          <Plus /> Dodaj metodę
        </button>
      </form>

      <div className="admin-page__panel">
        <div className="admin-page__panel-header">
          <h2>Dostępne metody</h2>
          <span className="admin-delivery-free-note">
            Darmowa dostawa od {money(settings.freeShippingFrom, settings.currency)}
          </span>
        </div>

        {methods.length === 0 ? (
          <div className="admin-orders-empty">
            <strong>Brak metod dostawy</strong>
            <p>Dodaj pierwszą metodę w formularzu powyżej.</p>
          </div>
        ) : (
          <div className="admin-delivery-list">
            {methods.map((method) => {
              const editing = editingId === method.id;

              return (
                <article
                  className={`admin-delivery-item${
                    method.active ? "" : " admin-delivery-item--inactive"
                  }`}
                  key={method.id}
                >
                  {editing ? (
                    <div className="admin-delivery-edit">
                      <div className="admin-delivery-edit__grid">
                        <label>
                          <span>Nazwa</span>
                          <input
                            name="name"
                            value={editForm.name}
                            onChange={updateEditField}
                          />
                        </label>
                        <label>
                          <span>Koszt</span>
                          <input
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={editForm.price}
                            onChange={updateEditField}
                          />
                        </label>
                        <label>
                          <span>Czas dostawy</span>
                          <input
                            name="eta"
                            value={editForm.eta}
                            onChange={updateEditField}
                          />
                        </label>
                        <label className="admin-delivery-form__toggle">
                          <input
                            name="active"
                            type="checkbox"
                            checked={editForm.active}
                            onChange={updateEditField}
                          />
                          <span>Aktywna</span>
                        </label>
                        <label className="admin-delivery-edit__full">
                          <span>Opis</span>
                          <textarea
                            name="description"
                            rows="3"
                            value={editForm.description}
                            onChange={updateEditField}
                          />
                        </label>
                      </div>

                      <div className="admin-delivery-item__actions">
                        <button
                          className="admin-page__button"
                          type="button"
                          onClick={() => saveEdit(method.id)}
                        >
                          <Save /> Zapisz
                        </button>
                        <button
                          className="admin-page__icon-btn"
                          type="button"
                          onClick={() => setEditingId(null)}
                        >
                          <X /> Anuluj
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="admin-delivery-item__icon">
                        {method.active ? <Truck /> : <PackageCheck />}
                      </div>

                      <div className="admin-delivery-item__content">
                        <div className="admin-delivery-item__title">
                          <strong>{method.name}</strong>
                          <span
                            className={
                              method.active
                                ? "admin-delivery-status admin-delivery-status--active"
                                : "admin-delivery-status"
                            }
                          >
                            {method.active ? "Aktywna" : "Wyłączona"}
                          </span>
                        </div>
                        <p>{method.description || "Brak opisu."}</p>
                        <div className="admin-delivery-item__meta">
                          <span>{method.eta || "Czas nieokreślony"}</span>
                          <strong>{money(method.price, settings.currency)}</strong>
                        </div>
                      </div>

                      <div className="admin-delivery-item__actions">
                        <button
                          className="admin-page__icon-btn"
                          type="button"
                          onClick={() => startEdit(method)}
                        >
                          <Pencil /> Edytuj
                        </button>
                        <button
                          className="admin-page__icon-btn"
                          type="button"
                          onClick={() => handleToggle(method)}
                        >
                          <Power /> {method.active ? "Wyłącz" : "Włącz"}
                        </button>
                        <button
                          className="admin-page__icon-btn admin-page__icon-btn--danger"
                          type="button"
                          onClick={() => handleDelete(method)}
                        >
                          <Trash2 /> Usuń
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
