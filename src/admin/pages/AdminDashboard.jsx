import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../utils/orderStorage";
import { getAdminProducts } from "../utils/productStorage";
import "./AdminDashboard.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

function isCurrentMonth(value) {
  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function AdminDashboard() {
  const [orders, setOrders] = useState(() => getOrders());
  const [products, setProducts] = useState(() => getAdminProducts());

  const refreshDashboard = () => {
    setOrders(getOrders());
    setProducts(getAdminProducts());
  };

  useEffect(() => {
    refreshDashboard();

    const handleStorage = (event) => {
      if (
        event.key === "ilvs_orders" ||
        event.key === "ilvs_admin_products"
      ) {
        refreshDashboard();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshDashboard);
    window.addEventListener("ilvs:products-updated", refreshDashboard);
    window.addEventListener("ilvs:orders-updated", refreshDashboard);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshDashboard);
      window.removeEventListener("ilvs:products-updated", refreshDashboard);
      window.removeEventListener("ilvs:orders-updated", refreshDashboard);
    };
  }, []);

  const dashboardData = useMemo(() => {
    const monthOrders = orders.filter((order) => isCurrentMonth(order.createdAt));
    const monthSales = monthOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const uniqueCustomers = new Set(
      orders
        .map((order) => order.customer?.email?.trim().toLowerCase())
        .filter(Boolean)
    );

    const newOrders = orders.filter((order) => order.status === "Nowe");

    return {
      monthOrders,
      monthSales,
      newOrders,
      customers: uniqueCustomers.size,
      recentOrders: orders.slice(0, 5),
    };
  }, [orders]);

  const stats = [
    {
      title: "Nowe zamówienia",
      value: String(dashboardData.newOrders.length),
      note:
        dashboardData.newOrders.length === 1
          ? "1 zamówienie oczekuje"
          : `${dashboardData.newOrders.length} zamówień oczekuje`,
      icon: "▤",
    },
    {
      title: "Sprzedaż",
      value: formatMoney(dashboardData.monthSales),
      note: `Bieżący miesiąc • ${dashboardData.monthOrders.length} zam.`,
      icon: "↗",
    },
    {
      title: "Produkty",
      value: String(products.length),
      note: "Dodane przez panel",
      icon: "◈",
    },
    {
      title: "Klienci",
      value: String(dashboardData.customers),
      note: "Unikalni kupujący",
      icon: "◉",
    },
  ];

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard__welcome">
        <div>
          <span className="admin-dashboard__badge">DASHBOARD</span>
          <h2>Witaj w panelu ILVS Audio</h2>
          <p>
            Dashboard pokazuje aktualne dane sklepu: zamówienia, sprzedaż z bieżącego
            miesiąca, produkty oraz klientów.
          </p>
        </div>
        <div className="admin-dashboard__status">
          <span />
          Dane aktualne
        </div>
      </div>

      <div className="admin-dashboard__stats">
        {stats.map((stat) => (
          <article className="admin-stat-card" key={stat.title}>
            <div className="admin-stat-card__top">
              <span className="admin-stat-card__icon">{stat.icon}</span>
              <span className="admin-stat-card__label">{stat.title}</span>
            </div>
            <strong className="admin-stat-card__value">{stat.value}</strong>
            <p className="admin-stat-card__note">{stat.note}</p>
          </article>
        ))}
      </div>

      <div className="admin-dashboard__grid">
        <article className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <span>OSTATNIE ZAMÓWIENIA</span>
              <h3>Zamówienia</h3>
            </div>
            <b>{orders.length}</b>
          </div>

          {dashboardData.recentOrders.length === 0 ? (
            <div className="admin-empty-state">
              <div>▤</div>
              <h4>Brak zamówień</h4>
              <p>Nowe zamówienia klientów pojawią się tutaj automatycznie.</p>
            </div>
          ) : (
            <div className="admin-dashboard-orders">
              {dashboardData.recentOrders.map((order) => (
                <Link
                  to="/admin/zamowienia"
                  className="admin-dashboard-order"
                  key={order.id}
                >
                  <div className="admin-dashboard-order__main">
                    <strong>{order.number}</strong>
                    <span>
                      {order.customer?.firstName} {order.customer?.lastName}
                    </span>
                    <small>{formatDate(order.createdAt)}</small>
                  </div>

                  <div className="admin-dashboard-order__right">
                    <strong>{formatMoney(order.total || 0)}</strong>
                    <span
                      className={
                        order.status === "Nowe"
                          ? "admin-dashboard-order__status admin-dashboard-order__status--new"
                          : "admin-dashboard-order__status"
                      }
                    >
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}

              <Link
                className="admin-dashboard-orders__all"
                to="/admin/zamowienia"
              >
                Zobacz wszystkie zamówienia →
              </Link>
            </div>
          )}
        </article>

        <article className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <span>SKRÓTY</span>
              <h3>Szybkie akcje</h3>
            </div>
          </div>

          <div className="admin-quick-actions">
            <Link
              className="admin-quick-actions__link admin-quick-actions__link--primary"
              to="/admin/produkty/dodaj"
            >
              + Dodaj produkt
            </Link>
            <Link className="admin-quick-actions__link" to="/admin/zamowienia">
              ▤ Zamówienia ({orders.length})
            </Link>
            <Link className="admin-quick-actions__link" to="/admin/produkty">
              ◈ Produkty ({products.length})
            </Link>
            <Link className="admin-quick-actions__link" to="/admin/kategorie">
              ▥ Kategorie
            </Link>
            <Link className="admin-quick-actions__link" to="/admin/ustawienia">
              ⚙ Ustawienia
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminDashboard;
