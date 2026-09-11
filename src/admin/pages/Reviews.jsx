import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import {
  addReview,
  getReviews,
  removeReview,
} from "../utils/reviewStorage";
import "./AdminPages.css";

const emptyForm = {
  customerName: "",
  customerRole: "",
  content: "",
  rating: 5,
};

const dateTime = (value) =>
  new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export default function Reviews() {
  const [reviews, setReviews] = useState(() => getReviews());
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => setReviews(getReviews());

    const handleStorage = (event) => {
      if (event.key === "ilvs_reviews") refresh();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("ilvs:reviews-updated", refresh);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("ilvs:reviews-updated", refresh);
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return reviews;

    return reviews.filter((review) =>
      `${review.customerName} ${review.customerRole} ${review.content}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [reviews, query]);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
      reviews.length
    );
  }, [reviews]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.customerName.trim() || !form.content.trim()) {
      setError("Podaj imię klienta oraz treść opinii.");
      return;
    }

    const review = addReview(form);
    setReviews(getReviews());
    setForm(emptyForm);
    setMessage(`Dodano opinię klienta ${review.customerName}. ✓`);
  };

  const handleDelete = (review) => {
    const accepted = window.confirm(
      `Czy na pewno chcesz usunąć opinię klienta ${review.customerName}?`
    );

    if (!accepted) return;

    const next = removeReview(review.id);
    setReviews(next);
    setMessage(`Usunięto opinię klienta ${review.customerName}.`);
    setError("");
  };

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-page__eyebrow">Treści sklepu</p>
          <h1 className="admin-page__title">Opinie klientów</h1>
          <p className="admin-page__description">
            Opinie są dodawane wyłącznie z panelu administratora i automatycznie
            pojawiają się w sekcji „Opinie” na stronie głównej sklepu.
          </p>
        </div>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <span>Wszystkie opinie</span>
          <strong>{reviews.length}</strong>
        </div>
        <div className="admin-page__stat">
          <span>Średnia ocena</span>
          <strong>{average.toFixed(1)} / 5</strong>
        </div>
      </div>

      <form
        className="admin-page__panel admin-review-form"
        onSubmit={handleSubmit}
      >
        <div className="admin-review-form__heading">
          <div>
            <span>DODAJ OPINIĘ</span>
            <h2>Nowa opinia klienta</h2>
          </div>
          <p>
            Klient nie ma formularza dodawania opinii po stronie sklepu.
            Publikacją zarządza administrator.
          </p>
        </div>

        {message && <div className="admin-page__success">{message}</div>}
        {error && (
          <div className="admin-product-form__message admin-product-form__message--error">
            {error}
          </div>
        )}

        <div className="admin-review-form__grid">
          <label className="admin-product-form__field">
            <span>Imię / nazwa klienta *</span>
            <input
              name="customerName"
              value={form.customerName}
              onChange={updateField}
              placeholder="np. Marcin"
              required
            />
          </label>

          <label className="admin-product-form__field">
            <span>Opis klienta</span>
            <input
              name="customerRole"
              value={form.customerRole}
              onChange={updateField}
              placeholder="np. DJ / producent"
            />
          </label>

          <label className="admin-product-form__field">
            <span>Ocena</span>
            <select
              name="rating"
              value={form.rating}
              onChange={updateField}
            >
              <option value="5">5 / 5</option>
              <option value="4">4 / 5</option>
              <option value="3">3 / 5</option>
              <option value="2">2 / 5</option>
              <option value="1">1 / 5</option>
            </select>
          </label>

          <label className="admin-product-form__field admin-review-form__content">
            <span>Treść opinii *</span>
            <textarea
              name="content"
              rows="5"
              maxLength="600"
              value={form.content}
              onChange={updateField}
              placeholder="Wpisz opinię klienta..."
              required
            />
            <small>{form.content.length}/600 znaków</small>
          </label>
        </div>

        <div className="admin-product-form__actions">
          <button className="admin-page__button" type="submit">
            + Dodaj opinię
          </button>
        </div>
      </form>

      <div className="admin-page__panel">
        <div className="admin-page__panel-header">
          <h2>Opublikowane opinie</h2>
          <input
            className="admin-page__search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj opinii..."
          />
        </div>

        {filtered.length === 0 ? (
          <div className="admin-orders-empty">
            <strong>Brak opinii</strong>
            <p>Dodaj pierwszą opinię klienta w formularzu powyżej.</p>
          </div>
        ) : (
          <div className="admin-review-list">
            {filtered.map((review) => (
              <article className="admin-review-item" key={review.id}>
                <div className="admin-review-item__top">
                  <div>
                    <strong>{review.customerName}</strong>
                    <span>{review.customerRole || "Klient ILVS Audio"}</span>
                  </div>

                  <div className="admin-review-item__rating">
                    <Star fill="currentColor" />
                    {review.rating}/5
                  </div>
                </div>

                <p>“{review.content}”</p>

                <div className="admin-review-item__footer">
                  <span>{dateTime(review.createdAt)}</span>
                  <button
                    type="button"
                    className="admin-page__icon-btn admin-page__icon-btn--danger"
                    onClick={() => handleDelete(review)}
                  >
                    Usuń
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
