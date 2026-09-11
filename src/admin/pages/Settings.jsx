import { useState } from "react";
import {
  getSettings,
  saveSettings,
} from "../utils/settingsStorage";
import "./AdminPages.css";

export default function Settings() {
  const [form, setForm] = useState(() => getSettings());
  const [saved, setSaved] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSaved(false);
  };

  const toggle = (name) => {
    setForm((current) => ({
      ...current,
      [name]: !current[name],
    }));
    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const next = saveSettings({
      ...form,
      standardShipping: Number(form.standardShipping),
      freeShippingFrom: Number(form.freeShippingFrom),
    });

    setForm(next);
    setSaved(true);
  };

  return (
    <section className="admin-page">
      <form onSubmit={handleSubmit}>
        <div className="admin-page__heading">
          <div>
            <p className="admin-page__eyebrow">Konfiguracja</p>
            <h1 className="admin-page__title">Ustawienia</h1>
            <p className="admin-page__description">
              Ustawienia są połączone ze sklepem. Zapisane zmiany wpływają m.in.
              na dane kontaktowe, dostawę, sprzedaż i wyświetlanie stanów magazynowych.
            </p>
          </div>

          <button className="admin-page__button" type="submit">
            Zapisz zmiany
          </button>
        </div>

        {saved && (
          <div className="admin-page__success admin-settings__saved">
            Ustawienia zostały zapisane i przekazane do sklepu. ✓
          </div>
        )}

        <div className="admin-settings">
          <article className="admin-page__panel admin-settings__card">
            <h2>Dane sklepu</h2>
            <p>
              Dane wykorzystywane w stopce sklepu oraz pozostałych elementach strony.
            </p>

            <div className="admin-settings__field">
              <label>Nazwa sklepu</label>
              <input
                name="storeName"
                value={form.storeName}
                onChange={updateField}
                required
              />
            </div>

            <div className="admin-settings__field">
              <label>Adres e-mail</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>

            <div className="admin-settings__field">
              <label>Telefon</label>
              <input
                name="phone"
                value={form.phone}
                onChange={updateField}
              />
            </div>

            <div className="admin-settings__field">
              <label>Adres sklepu</label>
              <input
                name="address"
                value={form.address}
                onChange={updateField}
              />
            </div>

            <div className="admin-settings__field">
              <label>Waluta</label>
              <select
                name="currency"
                value={form.currency}
                onChange={updateField}
              >
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
              </select>
              <small>
                Zmiana waluty zmienia sposób prezentacji kwot. Nie wykonuje automatycznego przewalutowania cen produktów.
              </small>
            </div>
          </article>

          <article className="admin-page__panel admin-settings__card">
            <h2>Sprzedaż</h2>
            <p>
              Włączaj i wyłączaj podstawowe funkcje sklepu.
            </p>

            <div className="admin-settings__switch">
              <div>
                <span>Aktywna sprzedaż</span>
                <small>Wyłączenie blokuje dodawanie produktów do koszyka i składanie zamówień.</small>
              </div>
              <button
                type="button"
                className={form.activeSales ? "admin-settings__toggle admin-settings__toggle--active" : "admin-settings__toggle"}
                aria-label="Aktywna sprzedaż"
                aria-pressed={form.activeSales}
                onClick={() => toggle("activeSales")}
              />
            </div>

            <div className="admin-settings__switch">
              <div>
                <span>Powiadomienia o zamówieniach</span>
                <small>Ustawienie jest zapisywane i będzie gotowe do wykorzystania po podłączeniu wysyłki e-mail z backendu.</small>
              </div>
              <button
                type="button"
                className={form.orderNotifications ? "admin-settings__toggle admin-settings__toggle--active" : "admin-settings__toggle"}
                aria-label="Powiadomienia"
                aria-pressed={form.orderNotifications}
                onClick={() => toggle("orderNotifications")}
              />
            </div>

            <div className="admin-settings__switch">
              <div>
                <span>Pokazuj stany magazynowe</span>
                <small>Kontroluje widoczność liczby sztuk na kartach produktów.</small>
              </div>
              <button
                type="button"
                className={form.showStock ? "admin-settings__toggle admin-settings__toggle--active" : "admin-settings__toggle"}
                aria-label="Stany magazynowe"
                aria-pressed={form.showStock}
                onClick={() => toggle("showStock")}
              />
            </div>
          </article>

          <article className="admin-page__panel admin-settings__card">
            <h2>Dostawa</h2>
            <p>
              Kwoty są wykorzystywane bezpośrednio podczas składania zamówienia.
            </p>

            <div className="admin-settings__field">
              <label>Standardowa dostawa</label>
              <input
                name="standardShipping"
                type="number"
                min="0"
                step="0.01"
                value={form.standardShipping}
                onChange={updateField}
                required
              />
            </div>

            <div className="admin-settings__field">
              <label>Darmowa dostawa od</label>
              <input
                name="freeShippingFrom"
                type="number"
                min="0"
                step="0.01"
                value={form.freeShippingFrom}
                onChange={updateField}
                required
              />
            </div>
          </article>

          <article className="admin-page__panel admin-settings__card">
            <h2>Panel administratora</h2>
            <p>
              Dane administratora wyświetlane w górnym pasku panelu.
            </p>

            <div className="admin-settings__field">
              <label>Nazwa użytkownika</label>
              <input
                name="adminName"
                value={form.adminName}
                onChange={updateField}
              />
            </div>

            <div className="admin-settings__field">
              <label>Rola</label>
              <input
                name="adminRole"
                value={form.adminRole}
                onChange={updateField}
              />
            </div>
          </article>
        </div>
      </form>
    </section>
  );
}
