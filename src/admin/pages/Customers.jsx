import { useEffect, useMemo, useState } from "react";
import {
  getOrders,
  removeOrdersByCustomerEmail,
} from "../utils/orderStorage";
import {
  cancelCustomerDeletion,
  getCustomerDeletionSchedule,
  getDueCustomerDeletions,
  scheduleCustomerDeletion,
} from "../utils/customerDeletionStorage";
import "./AdminPages.css";

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

const dateOnly = (value) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};

const statusClass = (status) => {
  if (status === "Wysłane") return "admin-page__badge--green";
  if (status === "W trakcie realizacji") return "admin-page__badge--orange";
  if (status === "Wstrzymane") return "admin-page__badge--yellow";
  if (status === "Anulowane") return "admin-page__badge--red";
  return "admin-page__badge--blue";
};

function buildCustomers(orders) {
  const byEmail = new Map();

  orders.forEach((order) => {
    const email = order.customer?.email?.trim().toLowerCase();
    if (!email) return;

    const current = byEmail.get(email) || {
      id: email,
      email,
      firstName: order.customer?.firstName || "",
      lastName: order.customer?.lastName || "",
      street: order.customer?.street || "",
      postalCode: order.customer?.postalCode || "",
      city: order.customer?.city || "",
      orders: [],
    };

    current.firstName = order.customer?.firstName || current.firstName;
    current.lastName = order.customer?.lastName || current.lastName;
    current.street = order.customer?.street || current.street;
    current.postalCode = order.customer?.postalCode || current.postalCode;
    current.city = order.customer?.city || current.city;
    current.orders.push(order);

    byEmail.set(email, current);
  });

  return Array.from(byEmail.values())
    .map((customer) => {
      const sortedOrders = [...customer.orders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const completedValue = sortedOrders
        .filter((order) => order.status !== "Anulowane")
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      const firstOrder = [...sortedOrders].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )[0];

      return {
        ...customer,
        orders: sortedOrders,
        orderCount: sortedOrders.length,
        totalValue: completedValue,
        firstOrderAt: firstOrder?.createdAt || "",
        lastOrderAt: sortedOrders[0]?.createdAt || "",
      };
    })
    .sort((a, b) => new Date(b.lastOrderAt) - new Date(a.lastOrderAt));
}

function isCurrentMonth(value) {
  if (!value) return false;

  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function todayInputValue() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function Customers() {
  const [orders, setOrders] = useState(() => getOrders());
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [deletionDate, setDeletionDate] = useState("");
  const [schedule, setSchedule] = useState(() =>
    getCustomerDeletionSchedule()
  );
  const [message, setMessage] = useState("");

  const refresh = () => {
    setOrders(getOrders());
    setSchedule(getCustomerDeletionSchedule());
  };

  const processDueDeletions = () => {
    const due = getDueCustomerDeletions();
    if (!due.length) return;

    due.forEach((entry) => {
      removeOrdersByCustomerEmail(entry.email);
      cancelCustomerDeletion(entry.email);
    });

    setOrders(getOrders());
    setSchedule(getCustomerDeletionSchedule());

    if (
      selected &&
      due.some(
        (entry) =>
          entry.email === String(selected.email || "").trim().toLowerCase()
      )
    ) {
      setSelected(null);
    }
  };

  useEffect(() => {
    processDueDeletions();
    refresh();

    const handleStorage = (event) => {
      if (
        event.key === "ilvs_orders" ||
        event.key === "ilvs_customer_deletion_schedule"
      ) {
        processDueDeletions();
        refresh();
      }
    };

    const handleFocus = () => {
      processDueDeletions();
      refresh();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("ilvs:orders-updated", handleFocus);
    window.addEventListener("ilvs:customer-deletion-updated", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("ilvs:orders-updated", handleFocus);
      window.removeEventListener("ilvs:customer-deletion-updated", handleFocus);
    };
  }, []);

  const customers = useMemo(() => buildCustomers(orders), [orders]);

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return customers;

    return customers.filter((customer) =>
      `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.city}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [customers, query]);

  const stats = useMemo(() => {
    const returning = customers.filter(
      (customer) => customer.orderCount >= 2
    ).length;

    const newThisMonth = customers.filter((customer) =>
      isCurrentMonth(customer.firstOrderAt)
    ).length;

    const averageOrders =
      customers.length > 0 ? orders.length / customers.length : 0;

    return {
      all: customers.length,
      newThisMonth,
      returning,
      averageOrders,
    };
  }, [customers, orders.length]);

  const selectedSchedule = selected
    ? schedule[String(selected.email || "").trim().toLowerCase()]
    : null;

  const openProfile = (customer) => {
    setSelected(customer);
    const scheduled =
      schedule[String(customer.email || "").trim().toLowerCase()];
    setDeletionDate(scheduled?.date || "");
    setMessage("");
  };

  const handleScheduleDeletion = () => {
    if (!selected || !deletionDate) return;

    const accepted = window.confirm(
      `Zaplanować automatyczne usunięcie danych klienta ${selected.firstName} ${selected.lastName} na dzień ${dateOnly(deletionDate)}? Usunięte zostaną także wszystkie zamówienia tego klienta.`
    );

    if (!accepted) return;

    scheduleCustomerDeletion(selected.email, deletionDate);
    setSchedule(getCustomerDeletionSchedule());
    setMessage(
      `Usunięcie danych zaplanowano na ${dateOnly(deletionDate)}.`
    );

    processDueDeletions();
  };

  const handleCancelDeletion = () => {
    if (!selected) return;

    cancelCustomerDeletion(selected.email);
    setSchedule(getCustomerDeletionSchedule());
    setDeletionDate("");
    setMessage("Zaplanowane usunięcie danych zostało anulowane.");
  };

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-page__eyebrow">Użytkownicy</p>
          <h1 className="admin-page__title">Klienci</h1>
          <p className="admin-page__description">
            Lista klientów jest tworzona automatycznie na podstawie zamówień
            złożonych w sklepie ILVS Audio.
          </p>
        </div>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <span>Klienci</span>
          <strong>{stats.all}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Nowi w tym miesiącu</span>
          <strong>{stats.newThisMonth}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Powracający</span>
          <strong>{stats.returning}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Śr. zamówień</span>
          <strong>{stats.averageOrders.toFixed(1)}</strong>
        </div>
      </div>

      <div className="admin-page__panel">
        <div className="admin-page__panel-header">
          <h2>Lista klientów</h2>
          <input
            className="admin-page__search"
            placeholder="Szukaj klienta..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="admin-orders-empty">
            <strong>
              {customers.length === 0 ? "Brak klientów" : "Brak wyników"}
            </strong>
            <p>
              {customers.length === 0
                ? "Klient pojawi się tutaj automatycznie po złożeniu pierwszego zamówienia."
                : "Nie znaleziono klienta pasującego do wyszukiwania."}
            </p>
          </div>
        ) : (
          <div className="admin-page__table-wrap">
            <table className="admin-page__table">
              <thead>
                <tr>
                  <th>Klient</th>
                  <th>E-mail</th>
                  <th>Miasto</th>
                  <th>Zamówienia</th>
                  <th>Wartość</th>
                  <th>Ostatnie zamówienie</th>
                  <th>Usunięcie danych</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const customerSchedule =
                    schedule[
                      String(customer.email || "").trim().toLowerCase()
                    ];

                  return (
                    <tr key={customer.id}>
                      <td>
                        <strong>
                          {customer.firstName} {customer.lastName}
                        </strong>
                      </td>
                      <td className="admin-page__muted">{customer.email}</td>
                      <td>{customer.city || "—"}</td>
                      <td>{customer.orderCount}</td>
                      <td>
                        <strong>{money(customer.totalValue)}</strong>
                      </td>
                      <td>
                        {customer.lastOrderAt
                          ? dateTime(customer.lastOrderAt)
                          : "—"}
                      </td>
                      <td>
                        {customerSchedule ? (
                          <span className="admin-page__badge admin-page__badge--red">
                            {dateOnly(customerSchedule.date)}
                          </span>
                        ) : (
                          <span className="admin-page__muted">Nie zaplanowano</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="admin-page__icon-btn"
                          type="button"
                          onClick={() => openProfile(customer)}
                        >
                          Profil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="admin-order-modal"
          onClick={() => setSelected(null)}
        >
          <div
            className="admin-order-modal__content admin-customer-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-order-modal__header">
              <div>
                <span>Profil klienta</span>
                <h2>
                  {selected.firstName} {selected.lastName}
                </h2>
              </div>
              <button type="button" onClick={() => setSelected(null)}>
                ×
              </button>
            </div>

            <div className="admin-order-details">
              <div className="admin-order-details__box">
                <span>E-mail</span>
                <strong>{selected.email}</strong>
                <p>Identyfikacja klienta odbywa się po adresie e-mail.</p>
              </div>

              <div className="admin-order-details__box">
                <span>Adres</span>
                <strong>{selected.street || "Brak danych"}</strong>
                <p>
                  {selected.postalCode} {selected.city}
                </p>
              </div>

              <div className="admin-order-details__box">
                <span>Zamówienia</span>
                <strong>{selected.orderCount}</strong>
                <p>
                  Pierwsze:{" "}
                  {selected.firstOrderAt
                    ? dateTime(selected.firstOrderAt)
                    : "—"}
                </p>
              </div>

              <div className="admin-order-details__box">
                <span>Wartość zakupów</span>
                <strong>{money(selected.totalValue)}</strong>
                <p>Anulowane zamówienia nie są wliczane do wartości.</p>
              </div>
            </div>

            <div className="admin-customer-deletion">
              <div>
                <span className="admin-customer-deletion__eyebrow">
                  Automatyczne usunięcie danych
                </span>
                <h3>Wybierz dokładną datę</h3>
                <p>
                  W wybranym dniu system usunie profil klienta oraz wszystkie
                  jego zamówienia.
                </p>
              </div>

              {message && (
                <div className="admin-customer-deletion__message">
                  {message}
                </div>
              )}

              {selectedSchedule && (
                <div className="admin-customer-deletion__scheduled">
                  Zaplanowano na:{" "}
                  <strong>{dateOnly(selectedSchedule.date)}</strong>
                </div>
              )}

              <div className="admin-customer-deletion__controls">
                <input
                  type="date"
                  min={todayInputValue()}
                  value={deletionDate}
                  onChange={(event) => setDeletionDate(event.target.value)}
                />

                <button
                  type="button"
                  className="admin-page__icon-btn admin-page__icon-btn--danger"
                  disabled={!deletionDate}
                  onClick={handleScheduleDeletion}
                >
                  Zaplanuj usunięcie
                </button>

                {selectedSchedule && (
                  <button
                    type="button"
                    className="admin-page__icon-btn"
                    onClick={handleCancelDeletion}
                  >
                    Anuluj termin
                  </button>
                )}
              </div>
            </div>

            <h3>Historia zamówień</h3>

            <div className="admin-customer-orders">
              {selected.orders.map((order) => (
                <div className="admin-customer-order" key={order.id}>
                  <div>
                    <strong>{order.number}</strong>
                    <span>{dateTime(order.createdAt)}</span>
                  </div>

                  <div className="admin-customer-order__right">
                    <strong>{money(order.total)}</strong>
                    <span
                      className={`admin-page__badge ${statusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
