import { useEffect, useState } from "react";
import { getSettings } from "../utils/settingsStorage";
import "./AdminHeader.css";

function AdminHeader() {
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

  const initial = (settings.adminName || "A").trim().charAt(0).toUpperCase();

  return (
    <header className="admin-header">
      <div className="admin-header__welcome">
        <p className="admin-header__eyebrow">{settings.storeName}</p>
        <h1 className="admin-header__title">Witam w panelu ILVS</h1>
      </div>

      <div className="admin-header__actions">
        <button
          className="admin-header__icon-button"
          type="button"
          aria-label="Powiadomienia"
        >
          ◌
          {settings.orderNotifications && <span className="admin-header__dot" />}
        </button>

        <div className="admin-header__user">
          <div className="admin-header__avatar">{initial}</div>
          <div className="admin-header__user-data">
            <strong>{settings.adminName || "Administrator"}</strong>
            <span>{settings.adminRole || "Panel główny"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
