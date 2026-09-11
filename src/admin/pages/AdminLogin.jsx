import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, User } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/ilvs-audio-logo.png";
import {
  createAdminSession,
  isAdminAuthenticated,
  verifyAdminCredentials,
} from "../utils/adminAuth";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    login: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!verifyAdminCredentials(form.login, form.password)) {
      setError("Nieprawidłowy login lub hasło.");
      return;
    }

    createAdminSession();

    const target =
      location.state?.from &&
      location.state.from.startsWith("/admin") &&
      location.state.from !== "/admin/login"
        ? location.state.from
        : "/admin";

    navigate(target, { replace: true });
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-card__brand">
          <img src={logo} alt="ILVS Audio" />
          <span>ADMIN PANEL</span>
        </div>

        <div className="admin-login-card__heading">
          <span>BEZPIECZNY DOSTĘP</span>
          <h1>Logowanie administratora</h1>
          <p>Zaloguj się, aby uzyskać dostęp do panelu ILVS Audio.</p>
        </div>

        {error && (
          <div className="admin-login-card__error" role="alert">
            {error}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            <span>Login</span>
            <div className="admin-login-form__input">
              <User />
              <input
                name="login"
                value={form.login}
                onChange={updateField}
                autoComplete="username"
                placeholder="Wpisz login"
                required
                autoFocus
              />
            </div>
          </label>

          <label>
            <span>Hasło</span>
            <div className="admin-login-form__input">
              <LockKeyhole />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
                autoComplete="current-password"
                placeholder="Wpisz hasło"
                required
              />
              <button
                type="button"
                className="admin-login-form__password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>

          <button className="admin-login-form__submit" type="submit">
            <LogIn />
            Zaloguj się
          </button>
        </form>

        <div className="admin-login-card__demo">
          <span>Dane startowe projektu</span>
          <strong>Login: admin</strong>
          <strong>Hasło: ILVS1234</strong>
        </div>
      </section>
    </main>
  );
}
