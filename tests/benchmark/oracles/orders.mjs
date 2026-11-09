import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const target = process.argv[2];
if (!target) throw new Error('Usage: node orders.mjs <fixture-directory>');
const { listOrders } = await import(pathToFileURL(resolve(target, 'orders.js')).href);
const { listOrderIds } = await import(pathToFileURL(resolve(target, 'consumer.js')).href);

assert.deepEqual(listOrders().map(({ id }) => id), [1, 2, 3]);
assert.deepEqual(listOrders('pending').map(({ id }) => id), [1, 3]);
assert.deepEqual(listOrders('shipped').map(({ id }) => id), [2]);
assert.throws(() => listOrders('unknown'), RangeError);
assert.deepEqual(listOrderIds('shipped'), [2]);
assert.deepEqual(listOrderIds(), [1, 2, 3]);
assert.deepEqual(listOrders().map(({ id }) => id), [1, 2, 3]);
console.log('filter: PASS');
