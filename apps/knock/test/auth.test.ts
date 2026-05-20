import test from 'node:test';
import assert from 'node:assert/strict';

import { parseBasicAuth } from '../src/auth.js';

test('parseBasicAuth decodes username and password', () => {
  const header = `Basic ${Buffer.from('admin:secret', 'utf-8').toString('base64')}`;
  const parsed = parseBasicAuth(header);

  assert.deepEqual(parsed, { username: 'admin', password: 'secret' });
});

test('parseBasicAuth rejects missing or malformed headers', () => {
  assert.equal(parseBasicAuth(undefined), null);
  assert.equal(parseBasicAuth('Bearer token'), null);
  assert.equal(parseBasicAuth(`Basic ${Buffer.from('no-separator', 'utf-8').toString('base64')}`), null);
});
