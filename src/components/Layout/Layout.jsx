import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import CartDrawer from '../CartDrawer/CartDrawer';

function Layout() {
  return (
    <>
      <Navbar />
      <main><Outlet /></main>
      <Footer />
      <CartDrawer />
    </>
  );
}

export default Layout;
