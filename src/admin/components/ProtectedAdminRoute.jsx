import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "../utils/adminAuth";

export default function ProtectedAdminRoute({ children }) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return children;
}
