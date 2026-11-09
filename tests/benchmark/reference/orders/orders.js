export const orders = [
  { id: 1, status: "pending", amount: 10 },
  { id: 2, status: "shipped", amount: 20 },
  { id: 3, status: "pending", amount: 30 },
];

const statuses = new Set(["pending", "shipped"]);

export function listOrders(status) {
  if (status === undefined) return orders;
  if (!statuses.has(status)) throw new RangeError(`unknown status: ${status}`);
  return orders.filter((order) => order.status === status);
}

export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.amount, 0);
}
