import { useMemo, useState } from "react";
import {
  getOrders,
  removeOrder,
  updateOrderStatus,
} from "../utils/orderStorage";
import "./AdminPages.css";

const ORDER_STATUSES = [
  "Wysłane",
  "W trakcie realizacji",
  "Wstrzymane",
  "Anulowane",
];

const money = (value) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(Number(value) || 0);

const dateTime = (value) =>
  new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

const statusClass = (status) => {
  if (status === "Wysłane") return "admin-page__badge--green";
  if (status === "W trakcie realizacji") return "admin-page__badge--orange";
  if (status === "Wstrzymane") return "admin-page__badge--yellow";
  if (status === "Anulowane") return "admin-page__badge--red";
  return "admin-page__badge--blue";
};

export default function Orders() {
  const [orders, setOrders] = useState(() => getOrders());
  const [selected, setSelected] = useState(null);
  const [openActions, setOpenActions] = useState(null);

  const stats = useMemo(
    () => ({
      all: orders.length,
      processing: orders.filter((order) => order.status === "W trakcie realizacji").length,
      shipped: orders.filter((order) => order.status === "Wysłane").length,
      held: orders.filter((order) => order.status === "Wstrzymane").length,
      cancelled: orders.filter((order) => order.status === "Anulowane").length,
    }),
    [orders]
  );

  const handleStatusChange = (order, status) => {
    const nextOrders = updateOrderStatus(order.id, status);
    setOrders(nextOrders);
    setOpenActions(null);

    if (selected?.id === order.id) {
      setSelected((current) => ({ ...current, status }));
    }
  };

  const handleDelete = (order) => {
    const shouldDelete = window.confirm(
      `Czy na pewno chcesz usunąć zamówienie ${order.number} z systemu?`
    );

    if (!shouldDelete) return;

    const nextOrders = removeOrder(order.id);
    setOrders(nextOrders);
    setOpenActions(null);

    if (selected?.id === order.id) {
      setSelected(null);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-page__eyebrow">Sprzedaż</p>
          <h1 className="admin-page__title">Zamówienia</h1>
          <p className="admin-page__description">
            Zarządzaj zamówieniami klientów, ich statusem i szczegółami.
          </p>
        </div>
      </div>

      <div className="admin-page__stats admin-page__stats--orders">
        <div className="admin-page__stat">
          <span>Wszystkie</span>
          <strong>{stats.all}</strong>
        </div>
        <div className="admin-page__stat">
          <span>W trakcie realizacji</span>
          <strong>{stats.processing}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Wysłane</span>
          <strong>{stats.shipped}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Wstrzymane</span>
          <strong>{stats.held}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Anulowane</span>
          <strong>{stats.cancelled}</strong>
        </div>
      </div>

      <div className="admin-page__panel">
        <div className="admin-page__panel-header">
          <h2>Lista zamówień</h2>
        </div>

        {orders.length === 0 ? (
          <div className="admin-orders-empty">
            <strong>Brak zamówień</strong>
            <p>Nowe zamówienia klientów będą pojawiały się w tym miejscu.</p>
          </div>
        ) : (
          <div className="admin-page__table-wrap">
            <table className="admin-page__table">
              <thead>
                <tr>
                  <th>Numer</th>
                  <th>Klient</th>
                  <th>Data</th>
                  <th>Płatność</th>
                  <th>Kwota</th>
                  <th>Status</th>
                  <th>Akcje</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.number}</strong>
                    </td>
                    <td>
                      <strong>
                        {order.customer.firstName} {order.customer.lastName}
                      </strong>
                      <br />
                      <small>{order.customer.email}</small>
                    </td>
                    <td>{dateTime(order.createdAt)}</td>
                    <td>{order.payment}</td>
                    <td>
                      <strong>{money(order.total)}</strong>
                    </td>
                    <td>
                      <span
                        className={`admin-page__badge ${statusClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-order-actions">
                        <button
                          className="admin-page__icon-btn"
                          type="button"
                          onClick={() => setSelected(order)}
                        >
                          Szczegóły
                        </button>

                        <div className="admin-order-actions__dropdown">
                          <button
                            className="admin-page__icon-btn admin-page__icon-btn--accent"
                            type="button"
                            onClick={() =>
                              setOpenActions((current) =>
                                current === order.id ? null : order.id
                              )
                            }
                          >
                            Akcje ▾
                          </button>

                          {openActions === order.id && (
                            <div className="admin-order-actions__menu">
                              <span>Zmień status</span>

                              {ORDER_STATUSES.map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  className={
                                    order.status === status
                                      ? "admin-order-actions__status admin-order-actions__status--active"
                                      : "admin-order-actions__status"
                                  }
                                  onClick={() => handleStatusChange(order, status)}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          className="admin-page__icon-btn admin-page__icon-btn--danger"
                          type="button"
                          onClick={() => handleDelete(order)}
                        >
                          Usuń
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="admin-order-modal" onClick={() => setSelected(null)}>
          <div
            className="admin-order-modal__content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-order-modal__header">
              <div>
                <span>Zamówienie</span>
                <h2>{selected.number}</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)}>
                ×
              </button>
            </div>

            <div className="admin-order-details">
              <div className="admin-order-details__box">
                <span>Klient</span>
                <strong>
                  {selected.customer.firstName} {selected.customer.lastName}
                </strong>
                <p>{selected.customer.email}</p>
              </div>

              <div className="admin-order-details__box">
                <span>Adres dostawy</span>
                <strong>{selected.customer.street}</strong>
                <p>
                  {selected.customer.postalCode} {selected.customer.city}
                </p>
              </div>

              <div className="admin-order-details__box">
                <span>Płatność</span>
                <strong>{selected.payment}</strong>
                <p>Status: {selected.paymentStatus}</p>
              </div>

              <div className="admin-order-details__box">
                <span>Data i status</span>
                <strong>{dateTime(selected.createdAt)}</strong>
                <p>
                  Status:{" "}
                  <span
                    className={`admin-page__badge ${statusClass(selected.status)}`}
                  >
                    {selected.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="admin-order-modal__status-actions">
              <span>Zmień status zamówienia</span>
              <div>
                {ORDER_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={
                      selected.status === status
                        ? "admin-page__icon-btn admin-page__icon-btn--accent"
                        : "admin-page__icon-btn"
                    }
                    onClick={() => handleStatusChange(selected, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <h3>Produkty</h3>

            <div className="admin-order-products">
              {selected.items.map((item) => (
                <div className="admin-order-product" key={item.id}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <strong>{money(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="admin-order-totals">
              <div>
                <span>Produkty</span>
                <strong>{money(selected.subtotal)}</strong>
              </div>
              <div>
                <span>Dostawa</span>
                <strong>
                  {selected.shipping ? money(selected.shipping) : "Darmowa"}
                </strong>
              </div>
              <div className="admin-order-totals__total">
                <span>Razem</span>
                <strong>{money(selected.total)}</strong>
              </div>
            </div>

            <div className="admin-order-modal__footer">
              <button
                type="button"
                className="admin-page__icon-btn admin-page__icon-btn--danger"
                onClick={() => handleDelete(selected)}
              >
                Usuń zamówienie
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
