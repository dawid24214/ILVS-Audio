const STORAGE_KEY = "ilvs_store_settings";

export const DEFAULT_SETTINGS = {
  storeName: "ILVS Audio",
  email: "kontakt@ilvsaudio.pl",
  phone: "+48 123 456 789",
  address: "ul. Muzyczna 42, Warszawa",
  currency: "PLN",
  activeSales: true,
  orderNotifications: true,
  showStock: true,
  standardShipping: 9.99,
  freeShippingFrom: 500,
  adminName: "Administrator",
  adminRole: "Właściciel",
};

export function getSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...DEFAULT_SETTINGS,
      ...(parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {}),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  const next = {
    ...DEFAULT_SETTINGS,
    ...settings,
    standardShipping: Math.max(0, Number(settings.standardShipping) || 0),
    freeShippingFrom: Math.max(0, Number(settings.freeShippingFrom) || 0),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent("ilvs:settings-updated", { detail: next })
  );

  return next;
}
