import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('analytics network access does not enter the code execution frame',async()=>{
  const config=JSON.parse(await readFile('vercel.json','utf8'));
  const parent=config.headers[0].headers.find(header=>header.key==='Content-Security-Policy').value;
  const runner=config.headers.find(rule=>rule.source==='/runner.html').headers.find(header=>header.key==='Content-Security-Policy').value;
  assert.match(parent,/script-src 'self' https:\/\/www\.googletagmanager\.com;/);
  assert.doesNotMatch(parent,/'unsafe-inline'|'unsafe-eval'/);
  assert.match(runner,/connect-src 'none'/);
  assert.match(runner,/default-src 'none'/);
  assert.doesNotMatch(runner,/google/);
});
