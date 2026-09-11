import { useEffect, useState } from "react";
import { getSettings } from "../admin/utils/settingsStorage";
import "./Page.css";

function Information() {
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    const refresh = () => setSettings(getSettings());
    window.addEventListener("ilvs:settings-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("ilvs:settings-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const currency = settings.currency === "EUR" ? "€" : "zł";

  return (
    <section className="page-section container">
      <header className="page-header page-header--left">
        <span className="eyebrow">INFORMACJE</span>
        <h1>INFORMACJE <span>&</span> POMOC</h1>
      </header>

      <div className="info-layout">
        <aside className="info-nav">
          <a href="#o-nas">O nas</a>
          <a href="#regulamin">Regulamin</a>
          <a href="#dostawa">Dostawa</a>
          <a href="#reklamacje">Reklamacje</a>
        </aside>

        <div className="info-content">
          <article id="o-nas" className="panel">
            <h2>O nas</h2>
            <p>
              {settings.storeName} to sklep stworzony z myślą o DJ-ach,
              producentach i miłośnikach dobrego brzmienia.
            </p>
          </article>

          <article id="regulamin" className="panel">
            <h2>Regulamin</h2>
            <p>
              Zakup produktu oznacza zawarcie umowy sprzedaży. Klient ma prawo
              odstąpić od umowy w ciągu 14 dni od otrzymania przesyłki.
            </p>
          </article>

          <article id="dostawa" className="panel">
            <h2>Dostawa i płatności</h2>
            <p>
              Standardowy koszt dostawy wynosi{" "}
              {Number(settings.standardShipping).toFixed(2)} {currency}.
              Zamówienia od {Number(settings.freeShippingFrom).toFixed(2)}{" "}
              {currency} otrzymują darmową dostawę.
            </p>
          </article>

          <article id="reklamacje" className="panel">
            <h2>Reklamacje</h2>
            <p>
              Reklamację możesz zgłosić pod adresem {settings.email}.
              Odpowiemy w terminie do 14 dni roboczych.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Information;
