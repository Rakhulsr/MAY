import { listOrders } from './orders.js';

export function listOrderIds() {
  return listOrders().map(({ id }) => id);
}
