import { useEffect, useState } from "react";
import { Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/ilvs-audio-logo.png";
import { getSettings } from "../../admin/utils/settingsStorage";
import "./Footer.css";

function Footer() {
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

  return (
    <footer id="kontakt" className="site-footer">
      <div className="container footer-grid">
        <section>
          <Link className="footer-brand" to="/">
            <img src={logo} alt={settings.storeName} />
            <span>{settings.storeName}</span>
          </Link>
          <p>
            Profesjonalny sprzęt audio i DJ, fachowe doradztwo i szybka dostawa.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Instagram"><Instagram /></a>
            <a href="#" aria-label="YouTube"><Youtube /></a>
          </div>
        </section>

        <section>
          <h3>Kategorie</h3>
          <Link to="/kategorie">Produkty</Link>
          <Link to="/kategorie">Sprzęt DJ</Link>
          <Link to="/kategorie">Audio</Link>
        </section>

        <section>
          <h3>Informacje</h3>
          <Link to="/informacje#o-nas">O nas</Link>
          <Link to="/informacje#regulamin">Regulamin</Link>
          <Link to="/informacje#dostawa">Dostawa i płatności</Link>
        </section>

        <section>
          <h3>Kontakt</h3>
          {settings.address && <p><MapPin /> {settings.address}</p>}
          {settings.phone && <p><Phone /> {settings.phone}</p>}
          {settings.email && <p><Mail /> {settings.email}</p>}
        </section>
      </div>

      <div className="container footer-bottom">
        © {new Date().getFullYear()} {settings.storeName}. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
}

export default Footer;
