import { useMemo, useState } from "react";
import { getCategories } from "../utils/categoryStorage";
import { Link, useNavigate } from "react-router-dom";
import { addAdminProduct } from "../utils/productStorage";
import "./AdminPages.css";

const initialForm = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  image: "",
};

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [imageName, setImageName] = useState("");
  const categories = useMemo(() => getCategories(), []);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.category &&
      Number(form.price) >= 0 &&
      form.price !== "" &&
      Number(form.stock) >= 0 &&
      form.stock !== ""
    );
  }, [form]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((current) => ({ ...current, image: "" }));
      setImageName("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Wybierz prawidłowy plik graficzny.");
      event.target.value = "";
      return;
    }

    // localStorage has limited capacity, so keep demo images reasonably small.
    if (file.size > 1_500_000) {
      setError("Zdjęcie jest za duże. Na tym etapie użyj pliku do 1,5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, image: String(reader.result || "") }));
      setImageName(file.name);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Uzupełnij nazwę, kategorię, cenę i stan magazynowy.");
      return;
    }

    const stock = Number(form.stock);
    const product = {
      id: `product-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      stock,
      status: stock === 0 ? "Brak na magazynie" : stock <= 5 ? "Niski stan" : "Aktywny",
      description: form.description.trim(),
      image: form.image,
      createdAt: new Date().toISOString(),
    };

    try {
      addAdminProduct(product);
      navigate("/admin/produkty", {
        state: { productAdded: true, productName: product.name },
      });
    } catch {
      setError(
        "Nie udało się zapisać produktu. Jeśli dodałeś duże zdjęcie, spróbuj użyć mniejszego pliku."
      );
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-page__eyebrow">Katalog / Produkty</p>
          <h1 className="admin-page__title">Dodaj produkt</h1>
          <p className="admin-page__description">
            Uzupełnij dane produktu. Po zapisaniu pojawi się on na liście produktów.
          </p>
        </div>

        <Link
          className="admin-page__button admin-page__button--secondary"
          to="/admin/produkty"
        >
          ← Wróć do produktów
        </Link>
      </div>

      <form className="admin-page__panel admin-product-form" onSubmit={handleSubmit}>
        {error && <div className="admin-product-form__message admin-product-form__message--error">{error}</div>}

        <div className="admin-product-form__grid">
          <label className="admin-product-form__field">
            <span>Nazwa produktu *</span>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              placeholder="np. Pioneer DDJ-FLX6"
              required
            />
          </label>

          <label className="admin-product-form__field">
            <span>Kategoria *</span>
            <select
              name="category"
              value={form.category}
              onChange={updateField}
              required
            >
              <option value="" disabled>Wybierz kategorię</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="admin-product-form__field">
            <span>Cena (zł) *</span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={updateField}
              placeholder="0.00"
              required
            />
          </label>

          <label className="admin-product-form__field">
            <span>Stan magazynowy *</span>
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={updateField}
              placeholder="0"
              required
            />
          </label>

          <label className="admin-product-form__field admin-product-form__field--full">
            <span>Zdjęcie produktu</span>
            <input type="file" accept="image/*" onChange={handleImage} />
            {imageName && <small>Wybrano: {imageName}</small>}
          </label>

          {form.image && (
            <div className="admin-product-form__preview admin-product-form__field--full">
              <img src={form.image} alt="Podgląd dodawanego produktu" />
              <div>
                <strong>Podgląd zdjęcia</strong>
                <button
                  type="button"
                  onClick={() => {
                    setForm((current) => ({ ...current, image: "" }));
                    setImageName("");
                  }}
                >
                  Usuń zdjęcie
                </button>
              </div>
            </div>
          )}

          <label className="admin-product-form__field admin-product-form__field--full">
            <span>Opis produktu</span>
            <textarea
              name="description"
              rows="7"
              value={form.description}
              onChange={updateField}
              placeholder="Wpisz opis produktu..."
            />
          </label>
        </div>

        <div className="admin-product-form__actions">
          <Link className="admin-product-form__cancel" to="/admin/produkty">
            Anuluj
          </Link>
          <button className="admin-page__button" type="submit" disabled={!canSubmit}>
            + Dodaj produkt
          </button>
        </div>
      </form>
    </section>
  );
}
