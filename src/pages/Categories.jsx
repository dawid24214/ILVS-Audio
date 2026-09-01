import { useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import { categories, products } from '../data/products';
import './Page.css';

function Categories() {
  const [category, setCategory] = useState('Wszystkie');
  const [sort, setSort] = useState('popular');
  const visible = useMemo(() => {
    const filtered = category === 'Wszystkie' ? [...products] : products.filter((p) => p.category === category);
    if (sort === 'price-asc') filtered.sort((a,b) => a.price-b.price);
    if (sort === 'price-desc') filtered.sort((a,b) => b.price-a.price);
    if (sort === 'name') filtered.sort((a,b) => a.name.localeCompare(b.name));
    return filtered;
  }, [category, sort]);

  return <section className="page-section container"><header className="page-header"><span className="eyebrow">KATEGORIE</span><h1>WSZYSTKIE <span>KATEGORIE</span></h1><p>Przeglądaj profesjonalny sprzęt audio i DJ.</p></header><div className="filter-bar"><div>{categories.map((item) => <button className={category===item?'filter-chip filter-chip--active':'filter-chip'} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="popular">Najpopularniejsze</option><option value="price-asc">Cena: rosnąco</option><option value="price-desc">Cena: malejąco</option><option value="name">Nazwa A–Z</option></select></div><div className="products-grid">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
}
export default Categories;
