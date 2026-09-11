import { Headphones, Lock, ShieldCheck, Star, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import { getStoreProducts } from '../data/storeProducts';
import { getReviews } from '../admin/utils/reviewStorage';
import './Home.css';

function Home() {
  const products = useMemo(() => getStoreProducts(), []);
  const [reviews, setReviews] = useState(() => getReviews());

  useEffect(() => {
    const refreshReviews = () => setReviews(getReviews());

    const handleStorage = (event) => {
      if (event.key === 'ilvs_reviews') refreshReviews();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('ilvs:reviews-updated', refreshReviews);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ilvs:reviews-updated', refreshReviews);
    };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero__background" />
        <div className="hero__glow hero__glow--one" /><div className="hero__glow hero__glow--two" />
        <div className="container hero__content">
          <span className="eyebrow">NOWA KOLEKCJA 2026</span>
          <h1>PROFESJONALNY <span>SPRZĘT AUDIO</span> DLA KAŻDEGO</h1>
          <p>Konsolety, miksery, słuchawki, głośniki i oświetlenie sceniczne w jednym miejscu.</p>
          <div className="hero__actions"><a className="button button--primary" href="#bestsellery">Zobacz ofertę</a><Link className="button button--ghost" to="/kategorie">Kategorie</Link></div>
          <div className="hero__stats"><div><strong>5000+</strong><span>produktów</span></div><div><strong>50+</strong><span>marek</span></div><div><strong>24h</strong><span>wysyłka</span></div></div>
        </div>
      </section>

      <section className="benefits"><div className="container benefits__grid">{[[Truck,'Szybka dostawa','Wysyłka w 24h'],[ShieldCheck,'Oryginalny sprzęt','100% autentyczności'],[Headphones,'Fachowe doradztwo','Eksperci audio'],[Lock,'Bezpieczne płatności','SSL i 3D Secure']].map(([Icon,title,text]) => <article key={title}><span><Icon /></span><div><strong>{title}</strong><p>{text}</p></div></article>)}</div></section>

      <section id="bestsellery" className="section container"><header className="section-heading"><span className="eyebrow">BESTSELLERY</span><h2>Najczęściej <span>wybierane</span></h2><p>Sprzęt ceniony przez profesjonalistów i pasjonatów muzyki.</p></header><div className="products-grid">{products.slice(0,4).map((product) => <ProductCard key={product.id} product={product} />)}</div><div className="section-action"><Link className="button button--ghost" to="/kategorie">Zobacz wszystkie produkty</Link></div></section>

      <section className="promo"><div className="container promo__inner"><div><span className="eyebrow eyebrow--light">LIMITOWANA OFERTA</span><h2>CZAS NA NOWY POZIOM <strong>BRZMIENIA!</strong></h2><p>Rabaty do 40% na wybrane produkty.</p><Link className="button button--dark" to="/kategorie">Sprawdź promocje</Link></div><div className="promo__image" /></div></section>

      <section id="opinie" className="section container">
        <header className="section-heading">
          <span className="eyebrow">OPINIE</span>
          <h2>Co mówią <span>klienci</span></h2>
        </header>

        {reviews.length > 0 ? (
          <div className="testimonials">
            {reviews.map((review) => (
              <blockquote key={review.id}>
                <div className="testimonial-rating" aria-label={`Ocena ${review.rating} na 5`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      fill={index < review.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p>“{review.content}”</p>
                <cite>
                  {review.customerName}
                  {review.customerRole ? ` — ${review.customerRole}` : ''}
                </cite>
              </blockquote>
            ))}
          </div>
        ) : (
          <div className="store-empty-state">
            <strong>Brak opublikowanych opinii</strong>
            <p>Opinie klientów są publikowane przez administratora sklepu.</p>
          </div>
        )}
      </section>
    </>
  );
}
export default Home;
