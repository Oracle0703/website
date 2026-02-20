import test from 'node:test';
import assert from 'node:assert/strict';

import { parseAccessLogLine } from '../src/parse.js';

test('parseAccessLogLine parses combined log lines', () => {
  const line =
    '1.2.3.4 - - [16/Feb/2026:20:11:10 +0800] "GET /wp-login.php?x=1 HTTP/1.1" 404 153 "-" "curl/8.0"';
  const r = parseAccessLogLine(line);
  assert.ok(r);
  assert.equal(r.ip, '1.2.3.4');
  assert.equal(r.method, 'GET');
  assert.equal(r.path, '/wp-login.php');
  assert.equal(r.status, 404);
  assert.equal(r.bytes, 153);
  assert.equal(r.suspicious, 1);
  assert.equal(r.suspiciousReason, 'probe:wordpress');
  assert.ok(r.tsMs > 0);
});
