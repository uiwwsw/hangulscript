import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSource } from '../src/formatter.js';
import { compileSource } from '../src/transformer.js';

test('formatter normalizes indentation while preserving executable structure and literals', () => {
  const before = '인사(이름)를 정의한다:  \n  # 설명  \n  만약 참 이라면:\n      돌려주기 "공백  두 칸 : #"   \n\n\n출력(인사("하늘"))';
  const after = formatSource(before);
  assert.match(after, /\n    만약 참 이라면:\n        돌려주기 "공백  두 칸 : #"/);
  assert.equal(formatSource(after), after);
  assert.equal(compileSource(before), compileSource(after));
  assert.ok(after.endsWith('\n')); assert.ok(!after.includes('\n\n\n'));
});

test('formatter supports VS Code tab size, tabs, CRLF and safe refusal of invalid code', () => {
  assert.equal(formatSource('만약 참 이라면:\n\t출력(1)', { tabSize: 2 }), '만약 참 이라면:\n  출력(1)\n');
  assert.equal(formatSource('출력("a  b")  \r\n'), '출력("a  b")\r\n');
  assert.throws(() => formatSource('만약 참 이라면:\n출력(1)'), /들여/);
  assert.throws(() => formatSource('출력(1)', { tabSize: 0 }), /1~8/);
});
