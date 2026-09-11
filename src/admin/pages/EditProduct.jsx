import { useMemo, useState } from "react";
import { getCategories } from "../utils/categoryStorage";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getAdminProducts,
  getStockStatus,
  updateAdminProduct,
} from "../utils/productStorage";
import "./AdminPages.css";

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const product = useMemo(
    () => getAdminProducts().find((item) => item.id === productId),
    [productId]
  );

  const [form, setForm] = useState(() => ({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price ?? "",
    stock: product?.stock ?? "",
    description: product?.description || "",
    image: product?.image || "",
  }));
  const [error, setError] = useState("");
  const [imageName, setImageName] = useState("");
  const categories = useMemo(() => getCategories(), []);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.category &&
      form.price !== "" &&
      Number(form.price) >= 0 &&
      form.stock !== "" &&
      Number(form.stock) >= 0
    );
  }, [form]);

  if (!product) {
    return (
      <section className="admin-page">
        <div className="admin-page__panel admin-product-edit-missing">
          <h2>Nie znaleziono produktu</h2>
          <p>Produkt mógł zostać wcześniej usunięty.</p>
          <Link className="admin-page__button" to="/admin/produkty">
            ← Wróć do listy produktów
          </Link>
        </div>
      </section>
    );
  }

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Wybierz prawidłowy plik graficzny.");
      event.target.value = "";
      return;
    }

    if (file.size > 1_500_000) {
      setError("Zdjęcie jest za duże. Użyj pliku do 1,5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        image: String(reader.result || ""),
      }));
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

    try {
      const updatedProduct = updateAdminProduct(product.id, {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock,
        status: getStockStatus(stock),
        description: form.description.trim(),
        image: form.image,
      });

      navigate("/admin/produkty", {
        state: {
          productUpdated: true,
          productName: updatedProduct?.name || form.name.trim(),
        },
      });
    } catch {
      setError(
        "Nie udało się zapisać zmian. Jeśli używasz dużego zdjęcia, wybierz mniejszy plik."
      );
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-page__eyebrow">Katalog / Produkty</p>
          <h1 className="admin-page__title">Edytuj produkt</h1>
          <p className="admin-page__description">
            Zmień dane produktu. Po zapisaniu nowe dane pojawią się również w sklepie.
          </p>
        </div>

        <Link
          className="admin-page__button admin-page__button--secondary"
          to="/admin/produkty"
        >
          ← Wróć do produktów
        </Link>
      </div>

      <form
        className="admin-page__panel admin-product-form"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="admin-product-form__message admin-product-form__message--error">
            {error}
          </div>
        )}

        <div className="admin-product-form__grid">
          <label className="admin-product-form__field">
            <span>Nazwa produktu *</span>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
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
              required
            />
            <small>
              Status po zapisaniu: <strong>{getStockStatus(form.stock)}</strong>
            </small>
          </label>

          <label className="admin-product-form__field admin-product-form__field--full">
            <span>Zmień zdjęcie produktu</span>
            <input type="file" accept="image/*" onChange={handleImage} />
            {imageName && <small>Wybrano: {imageName}</small>}
          </label>

          {form.image && (
            <div className="admin-product-form__preview admin-product-form__field--full">
              <img src={form.image} alt={`Podgląd ${form.name}`} />
              <div>
                <strong>Aktualne zdjęcie</strong>
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
          <button
            className="admin-page__button"
            type="submit"
            disabled={!canSubmit}
          >
            Zapisz zmiany
          </button>
        </div>
      </form>
    </section>
  );
}
