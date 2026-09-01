import { Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/ilvs-audio-logo.png';
import './Footer.css';

function Footer() {
  return (
    <footer id="kontakt" className="site-footer">
      <div className="container footer-grid">
        <section>
          <Link className="footer-brand" to="/"><img src={logo} alt="ILVS Audio" /><span>ILVS <strong>Audio</strong></span></Link>
          <p>Profesjonalny sprzęt audio i DJ, fachowe doradztwo i szybka dostawa.</p>
          <div className="social-links"><a href="#"><Instagram /></a><a href="#"><Youtube /></a></div>
        </section>
        <section><h3>Kategorie</h3><Link to="/kategorie">Konsolety</Link><Link to="/kategorie">Miksery</Link><Link to="/kategorie">Słuchawki</Link><Link to="/kategorie">Oświetlenie</Link></section>
        <section><h3>Informacje</h3><Link to="/informacje#o-nas">O nas</Link><Link to="/informacje#regulamin">Regulamin</Link><Link to="/informacje#dostawa">Dostawa i płatności</Link></section>
        <section><h3>Kontakt</h3><p><MapPin /> ul. Muzyczna 42, Warszawa</p><p><Phone /> +48 123 456 789</p><p><Mail /> kontakt@ilvsaudio.pl</p></section>
      </div>
      <div className="container footer-bottom">© 2026 ILVS Audio. Wszelkie prawa zastrzeżone.</div>
    </footer>
  );
}
export default Footer;
