const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const runMiddleware = (middleware, request) => new Promise((resolve) => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      resolve(this);
    },
  };
  middleware(request, response, () => resolve({ request, next: true, statusCode: 200 }));
});

test('authenticate rejects an invalid token', async () => {
  const response = await runMiddleware(authenticate, { headers: { authorization: 'Bearer invalid-token' } });
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, 'Invalid or expired token');
});

test('requireAdmin rejects a customer token', async () => {
  const request = { user: { userType: 'customer' } };
  const response = await runMiddleware(requireAdmin, request);
  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, 'Administrator access required');
});

test('authenticate accepts a valid customer token', async () => {
  const token = jwt.sign({ sub: 'customer-id', userType: 'customer' }, process.env.JWT_SECRET);
  const response = await runMiddleware(authenticate, { headers: { authorization: `Bearer ${token}` } });
  assert.equal(response.next, true);
  assert.equal(response.request.user.sub, 'customer-id');
});
