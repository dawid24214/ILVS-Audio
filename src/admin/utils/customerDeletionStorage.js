const STORAGE_KEY = "ilvs_customer_deletion_schedule";

export function getCustomerDeletionSchedule() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

export function saveCustomerDeletionSchedule(schedule) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  window.dispatchEvent(new CustomEvent("ilvs:customer-deletion-updated"));
  return schedule;
}

export function scheduleCustomerDeletion(email, date) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const schedule = getCustomerDeletionSchedule();

  schedule[normalizedEmail] = {
    email: normalizedEmail,
    date,
    createdAt: new Date().toISOString(),
  };

  return saveCustomerDeletionSchedule(schedule);
}

export function cancelCustomerDeletion(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const schedule = getCustomerDeletionSchedule();

  delete schedule[normalizedEmail];
  return saveCustomerDeletionSchedule(schedule);
}

export function getScheduledDeletion(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return getCustomerDeletionSchedule()[normalizedEmail] || null;
}

export function getDueCustomerDeletions(today = new Date()) {
  const schedule = getCustomerDeletionSchedule();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return Object.values(schedule).filter(
    (entry) => entry?.date && entry.date <= todayKey
  );
}
