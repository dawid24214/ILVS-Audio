import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import { getStoreCategories, getStoreProducts } from '../data/storeProducts';
import './Page.css';

function Categories() {
  const [products, setProducts] = useState(() => getStoreProducts());
  const [categories, setCategories] = useState(() => getStoreCategories(getStoreProducts()));

  const [category, setCategory] = useState('Wszystkie');
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    const refresh = () => {
      const nextProducts = getStoreProducts();
      const nextCategories = getStoreCategories(nextProducts);
      setProducts(nextProducts);
      setCategories(nextCategories);
      setCategory((current) =>
        nextCategories.includes(current) ? current : 'Wszystkie'
      );
    };

    const handleStorage = (event) => {
      if (event.key === 'ilvs_admin_products' || event.key === 'ilvs_categories') {
        refresh();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('ilvs:products-updated', refresh);
    window.addEventListener('ilvs:categories-updated', refresh);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ilvs:products-updated', refresh);
      window.removeEventListener('ilvs:categories-updated', refresh);
    };
  }, []);

  const visible = useMemo(() => {
    const filtered =
      category === 'Wszystkie'
        ? [...products]
        : products.filter((product) => product.category === category);

    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name, 'pl'));

    return filtered;
  }, [category, sort, products]);

  return (
    <section className="page-section container">
      <header className="page-header">
        <span className="eyebrow">KATEGORIE</span>
        <h1>WSZYSTKIE <span>KATEGORIE</span></h1>
        <p>Przeglądaj profesjonalny sprzęt audio i DJ.</p>
      </header>

      <div className="filter-bar">
        <div>
          {categories.map((item) => (
            <button
              className={category === item ? 'filter-chip filter-chip--active' : 'filter-chip'}
              key={item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="popular">Najpopularniejsze</option>
          <option value="price-asc">Cena: rosnąco</option>
          <option value="price-desc">Cena: malejąco</option>
          <option value="name">Nazwa A–Z</option>
        </select>
      </div>

      {visible.length > 0 ? (
        <div className="products-grid">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="store-empty-state">
          <strong>Brak produktów</strong>
          <p>Produkty są dodawane wyłącznie przez panel administratora.</p>
        </div>
      )}
    </section>
  );
}

export default Categories;
