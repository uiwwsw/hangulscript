import test from 'node:test';
import assert from 'node:assert/strict';
import { lintSource } from '../src/index.js';

const validSample = `값: 숫자는 1이다
더하기(왼쪽: 숫자, 오른쪽: 숫자)를 정의한다:
    돌려주기 왼쪽 + 오른쪽`;

test('lintSource reports no diagnostics for valid code', () => {
  const result = lintSource(validSample, '예시.hgs');
  assert.equal(result.hasErrors, false);
  assert.equal(result.diagnostics.length, 0);
});

test('sentence parser reports invalid syntax with original line', () => {
  assert.throws(() => lintSource('상수 값 = 1;'), /1행.*키워드형/);
});

test('lintSource reports semantic diagnostics from TypeScript', () => {
  const result = lintSource('값: 숫자는 "문자"이다');
  assert.equal(result.hasErrors, true);
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 2322));
  assert.ok(result.formattedDiagnostics.includes('Type'));
});
