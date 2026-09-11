import { Outlet } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import "./AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminHeader />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default AdminLayout;
