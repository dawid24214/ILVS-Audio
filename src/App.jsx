import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Checkout from './pages/Checkout';
import Information from './pages/Information';
import ProductDetails from './pages/ProductDetails';
import CustomerAccount from './pages/CustomerAccount';
import NotFound from './pages/NotFound';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import Products from './admin/pages/Products';
import AddProduct from './admin/pages/AddProduct';
import EditProduct from './admin/pages/EditProduct';
import Orders from './admin/pages/Orders';
import Customers from './admin/pages/Customers';
import Reviews from './admin/pages/Reviews';
import DeliveryMethods from './admin/pages/DeliveryMethods';
import AdminCategories from './admin/pages/AdminCategories';
import Settings from './admin/pages/Settings';
import AdminLogin from './admin/pages/AdminLogin';
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/kategorie" element={<Categories />} />
        <Route path="/kasa" element={<Checkout />} />
        <Route path="/produkt/:productId" element={<ProductDetails />} />
        <Route path="/informacje" element={<Information />} />
        <Route path="/konto" element={<CustomerAccount />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="produkty" element={<Products />} />
        <Route path="produkty/dodaj" element={<AddProduct />} />
        <Route path="produkty/:productId/edytuj" element={<EditProduct />} />
        <Route path="zamowienia" element={<Orders />} />
        <Route path="klienci" element={<Customers />} />
        <Route path="opinie" element={<Reviews />} />
        <Route path="dostawa" element={<DeliveryMethods />} />
        <Route path="kategorie" element={<AdminCategories />} />
        <Route path="ustawienia" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
