const STORAGE_KEY = "ilvs_delivery_methods";

const DEFAULT_METHODS = [
  {
    id: "delivery-courier",
    name: "Kurier",
    description: "Dostawa kurierem pod wskazany adres.",
    price: 14.99,
    eta: "1–2 dni robocze",
    active: true,
    createdAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "delivery-locker",
    name: "Paczkomat / punkt odbioru",
    description: "Odbiór przesyłki w wybranym automacie lub punkcie.",
    price: 12.99,
    eta: "1–2 dni robocze",
    active: true,
    createdAt: "2026-01-02T10:00:00.000Z",
  },
  {
    id: "delivery-pickup",
    name: "Odbiór osobisty",
    description: "Odbiór zamówienia bez kosztów dostawy.",
    price: 0,
    eta: "Po potwierdzeniu gotowości",
    active: true,
    createdAt: "2026-01-03T10:00:00.000Z",
  },
];

function normalizeMethod(method) {
  return {
    ...method,
    id: String(method.id || `delivery-${Date.now()}`),
    name: String(method.name || "").trim(),
    description: String(method.description || "").trim(),
    eta: String(method.eta || "").trim(),
    price: Math.max(0, Number(method.price) || 0),
    active: method.active !== false,
  };
}

export function getDeliveryMethods() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_METHODS));
      return DEFAULT_METHODS.map(normalizeMethod);
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeMethod) : [];
  } catch {
    return DEFAULT_METHODS.map(normalizeMethod);
  }
}

export function getActiveDeliveryMethods() {
  return getDeliveryMethods().filter((method) => method.active);
}

export function saveDeliveryMethods(methods) {
  const next = methods.map(normalizeMethod);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent("ilvs:delivery-methods-updated", { detail: next })
  );
  return next;
}

export function addDeliveryMethod(method) {
  const nextMethod = normalizeMethod({
    ...method,
    id: `delivery-${Date.now()}`,
    createdAt: new Date().toISOString(),
  });

  saveDeliveryMethods([nextMethod, ...getDeliveryMethods()]);
  return nextMethod;
}

export function updateDeliveryMethod(methodId, updates) {
  const next = getDeliveryMethods().map((method) =>
    method.id === methodId
      ? normalizeMethod({
          ...method,
          ...updates,
          id: method.id,
          updatedAt: new Date().toISOString(),
        })
      : method
  );

  saveDeliveryMethods(next);
  return next;
}

export function toggleDeliveryMethod(methodId) {
  const current = getDeliveryMethods().find((method) => method.id === methodId);
  if (!current) return getDeliveryMethods();

  return updateDeliveryMethod(methodId, { active: !current.active });
}

export function removeDeliveryMethod(methodId) {
  const next = getDeliveryMethods().filter((method) => method.id !== methodId);
  saveDeliveryMethods(next);
  return next;
}
