import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateTotal, listOrders } from "./orders.js";

test("listOrders returns every order", () => {
  assert.deepEqual(listOrders().map(({ id }) => id), [1, 2, 3]);
});

test("calculateTotal sums amounts", () => {
  assert.equal(calculateTotal(listOrders()), 60);
});
