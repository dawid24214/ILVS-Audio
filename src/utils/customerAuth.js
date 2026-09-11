const USERS_KEY = "ilvs_customer_accounts";
const SESSION_KEY = "ilvs_customer_session";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(String(password));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function getCustomerAccounts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomerAccounts(accounts) {
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
  window.dispatchEvent(new CustomEvent("ilvs:customer-accounts-updated"));
  return accounts;
}

export async function registerCustomer(data) {
  const email = normalizeEmail(data.email);
  const accounts = getCustomerAccounts();

  if (accounts.some((account) => normalizeEmail(account.email) === email)) {
    return { success: false, error: "Konto z tym adresem e-mail już istnieje." };
  }

  if (String(data.password || "").length < 6) {
    return { success: false, error: "Hasło musi mieć co najmniej 6 znaków." };
  }

  const passwordHash = await hashPassword(data.password);

  const account = {
    id: `customer-${Date.now()}`,
    email,
    passwordHash,
    firstName: String(data.firstName || "").trim(),
    lastName: String(data.lastName || "").trim(),
    street: "",
    postalCode: "",
    city: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveCustomerAccounts([account, ...accounts]);
  createCustomerSession(account);

  return { success: true, account };
}

export async function loginCustomer(email, password) {
  const normalized = normalizeEmail(email);
  const passwordHash = await hashPassword(password);
  const account = getCustomerAccounts().find(
    (item) => normalizeEmail(item.email) === normalized
  );

  if (!account || account.passwordHash !== passwordHash) {
    return { success: false, error: "Nieprawidłowy e-mail lub hasło." };
  }

  createCustomerSession(account);
  return { success: true, account };
}

export function createCustomerSession(account) {
  const session = {
    authenticated: true,
    customerId: account.id,
    email: normalizeEmail(account.email),
    createdAt: new Date().toISOString(),
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("ilvs:customer-auth-changed"));
  return session;
}

export function clearCustomerSession() {
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("ilvs:customer-auth-changed"));
}

export function getCustomerSession() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    return parsed?.authenticated ? parsed : null;
  } catch {
    return null;
  }
}

export function getCurrentCustomer() {
  const session = getCustomerSession();
  if (!session) return null;

  return (
    getCustomerAccounts().find(
      (account) =>
        account.id === session.customerId ||
        normalizeEmail(account.email) === normalizeEmail(session.email)
    ) || null
  );
}

export function updateCurrentCustomer(updates) {
  const current = getCurrentCustomer();
  if (!current) return null;

  const accounts = getCustomerAccounts();
  const nextEmail = normalizeEmail(updates.email ?? current.email);
  const duplicate = accounts.some(
    (account) =>
      account.id !== current.id &&
      normalizeEmail(account.email) === nextEmail
  );

  if (duplicate) return null;

  const next = accounts.map((account) =>
    account.id === current.id
      ? {
          ...account,
          ...updates,
          id: account.id,
          email: nextEmail,
          passwordHash: account.passwordHash,
          updatedAt: new Date().toISOString(),
        }
      : account
  );

  saveCustomerAccounts(next);

  const updated = next.find((account) => account.id === current.id);
  createCustomerSession(updated);
  return updated;
}

export async function changeCustomerPassword(currentPassword, newPassword) {
  const current = getCurrentCustomer();

  if (!current) {
    return { success: false, error: "Brak aktywnej sesji." };
  }

  const currentHash = await hashPassword(currentPassword);
  if (currentHash !== current.passwordHash) {
    return { success: false, error: "Aktualne hasło jest nieprawidłowe." };
  }

  if (String(newPassword || "").length < 6) {
    return { success: false, error: "Nowe hasło musi mieć co najmniej 6 znaków." };
  }

  const passwordHash = await hashPassword(newPassword);
  updateCurrentCustomer({ passwordHash });

  const accounts = getCustomerAccounts().map((account) =>
    account.id === current.id
      ? { ...account, passwordHash, updatedAt: new Date().toISOString() }
      : account
  );
  saveCustomerAccounts(accounts);

  return { success: true };
}
