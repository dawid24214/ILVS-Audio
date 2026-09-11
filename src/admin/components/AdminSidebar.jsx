import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAdminSession } from "../utils/adminAuth";
import { getSettings } from "../utils/settingsStorage";
import "./AdminSidebar.css";

const menuItems = [
  ["▦", "Dashboard", "/admin", true],
  ["◈", "Produkty", "/admin/produkty"],
  ["▤", "Zamówienia", "/admin/zamowienia"],
  ["◉", "Klienci", "/admin/klienci"],
  ["★", "Opinie", "/admin/opinie"],
  ["↗", "Dostawa", "/admin/dostawa"],
  ["▥", "Kategorie", "/admin/kategorie"],
  ["⚙", "Ustawienia", "/admin/ustawienia"],
];

function AdminSidebar() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    const refresh = () => setSettings(getSettings());
    window.addEventListener("ilvs:settings-updated", refresh);

    return () => {
      window.removeEventListener("ilvs:settings-updated", refresh);
    };
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  };

  const initial = (settings.adminName || "A").trim().charAt(0).toUpperCase();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__logo-mark">
          <span>IL</span>
          <b>VS</b>
        </div>
        <div className="admin-sidebar__brand-text">
          <strong>{settings.storeName || "ILVS Audio"}</strong>
          <span>ADMIN PANEL</span>
        </div>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Menu administratora">
        <p className="admin-sidebar__section-title">ZARZĄDZANIE</p>

        {menuItems.map(([icon, label, path, end]) => (
          <NavLink
            key={label}
            to={path}
            end={Boolean(end)}
            className={({ isActive }) =>
              `admin-sidebar__item${
                isActive ? " admin-sidebar__item--active" : ""
              }`
            }
          >
            <span className="admin-sidebar__item-icon">{icon}</span>
            <span className="admin-sidebar__item-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__avatar">{initial}</div>
        <div className="admin-sidebar__profile">
          <strong>{settings.adminName || "Administrator"}</strong>
          <span>{settings.adminRole || "Panel główny"}</span>
        </div>

        <button
          type="button"
          className="admin-sidebar__logout"
          onClick={handleLogout}
          aria-label="Wyloguj"
          title="Wyloguj"
        >
          <LogOut />
          <span>Wyloguj</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
