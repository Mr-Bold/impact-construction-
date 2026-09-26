const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

const startTestServer = async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
};

test('health endpoint reports a running backend', async (t) => {
  const { server, url } = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`${url}/api/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'ok');
});

test('registration rejects incomplete input', async (t) => {
  const { server, url } = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`${url}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'All registration fields are required');
});

test('admin endpoints require authentication', async (t) => {
  const { server, url } = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`${url}/api/admin/dashboard/stats`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, 'Authentication required');
});
