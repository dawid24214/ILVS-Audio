import { useEffect, useState } from 'react';
import { Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/ilvs-audio-logo.png';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['/', 'Strona główna'],
    ['/kategorie', 'Kategorie'],
    ['/informacje', 'Informacje'],
  ];

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__inner container">
        <NavLink className="brand" to="/" aria-label="ILVS Audio — strona główna">
          <img className="brand__logo" src={logo} alt="Logo ILVS Audio" />
          <span className="brand__name">ILVS <strong>Audio</strong></span>
        </NavLink>

        <nav className="desktop-nav" aria-label="Nawigacja główna">
          {links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
          <a href="/#opinie">Opinie</a>
          <a href="/#kontakt">Kontakt</a>
        </nav>

        <div className="header-actions">
          <button className="icon-button" onClick={() => setSearchOpen((value) => !value)} aria-label="Otwórz wyszukiwarkę"><Search /></button>
          <button className="icon-button desktop-only" aria-label="Konto użytkownika"><User /></button>
          <button className="icon-button cart-button" onClick={() => setIsCartOpen(true)} aria-label="Otwórz koszyk">
            <ShoppingCart /><span className="cart-button__badge">{itemCount}</span>
          </button>
          <button className="icon-button mobile-only" onClick={() => setMobileOpen(true)} aria-label="Otwórz menu"><Menu /></button>
        </div>
      </div>

      {searchOpen && <div className="search-panel"><div className="container search-panel__inner"><input autoFocus placeholder="Szukaj sprzętu audio..." /><button className="button button--primary">Szukaj</button></div></div>}

      <div className={`mobile-nav ${mobileOpen ? 'mobile-nav--open' : ''}`}>
        <button className="icon-button mobile-nav__close" onClick={() => setMobileOpen(false)}><X /></button>
        {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}>{label}</NavLink>)}
      </div>
    </header>
  );
}

export default Navbar;
