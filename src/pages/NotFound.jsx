import { Link } from 'react-router-dom';
import './Page.css';
export default function NotFound(){return <section className="page-section container success"><h1>404</h1><p>Nie znaleziono strony.</p><Link className="button button--primary" to="/">Wróć na stronę główną</Link></section>}
