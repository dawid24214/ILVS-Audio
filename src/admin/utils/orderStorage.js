const STORAGE_KEY = "ilvs_orders";

export function getOrders() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent("ilvs:orders-updated"));
  return orders;
}

export function addOrder(order) {
  const orders = getOrders();
  return saveOrders([order, ...orders]);
}

export function updateOrderStatus(orderId, status) {
  const nextOrders = getOrders().map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
          updatedAt: new Date().toISOString(),
        }
      : order
  );

  saveOrders(nextOrders);
  return nextOrders;
}

export function removeOrder(orderId) {
  const nextOrders = getOrders().filter((order) => order.id !== orderId);
  saveOrders(nextOrders);
  return nextOrders;
}


export function removeOrdersByCustomerEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const nextOrders = getOrders().filter(
    (order) =>
      String(order.customer?.email || "").trim().toLowerCase() !== normalizedEmail
  );

  saveOrders(nextOrders);
  return nextOrders;
}
