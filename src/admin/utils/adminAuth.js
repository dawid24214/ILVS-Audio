const SESSION_KEY = "ilvs_admin_session";
const CREDENTIALS_KEY = "ilvs_admin_credentials";

const DEFAULT_CREDENTIALS = {
  login: "admin",
  password: "ILVS1234",
};

export function getAdminCredentials() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || "null");

    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.login === "string" &&
      typeof parsed.password === "string"
    ) {
      return parsed;
    }
  } catch {
    // Use defaults.
  }

  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
  return { ...DEFAULT_CREDENTIALS };
}

export function verifyAdminCredentials(login, password) {
  const credentials = getAdminCredentials();

  return (
    String(login || "").trim() === credentials.login &&
    String(password || "") === credentials.password
  );
}

export function createAdminSession() {
  const session = {
    authenticated: true,
    createdAt: new Date().toISOString(),
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("ilvs:admin-auth-changed"));
  return session;
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("ilvs:admin-auth-changed"));
}

export function isAdminAuthenticated() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    return Boolean(parsed?.authenticated);
  } catch {
    return false;
  }
}
