export const orders = [
  { id: 1, status: "pending", amount: 10 },
  { id: 2, status: "shipped", amount: 20 },
  { id: 3, status: "pending", amount: 30 },
];

export function listOrders() {
  return orders;
}

export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.amount, 0);
}
