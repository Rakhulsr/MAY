import { listOrders } from './orders.js';

export function listOrderIds(status) {
  return listOrders(status).map(({ id }) => id);
}
