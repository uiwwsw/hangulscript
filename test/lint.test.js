import test from 'node:test';
import assert from 'node:assert/strict';
import { lintSource } from '../src/index.js';

const validSample = `상수 값: 숫자 = 1;
함수 더하기(왼쪽: 숫자, 오른쪽: 숫자): 숫자 {
  반환 왼쪽 + 오른쪽;
}`;

test('lintSource reports no diagnostics for valid code', () => {
  const result = lintSource(validSample, '예시.ks');
  assert.equal(result.hasErrors, false);
  assert.equal(result.diagnostics.length, 0);
});

test('lintSource reports syntax diagnostics from TypeScript', () => {
  const result = lintSource('상수 let = 1;');
  assert.equal(result.hasErrors, true);
  assert.ok(
    result.diagnostics.some((diagnostic) =>
      diagnostic.code === 1212 || diagnostic.code === 2480
    )
  );
  assert.ok(result.formattedDiagnostics.includes("let'"));
});

test('lintSource reports semantic diagnostics from TypeScript', () => {
  const result = lintSource('상수 값: 숫자 = "문자";');
  assert.equal(result.hasErrors, true);
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 2322));
  assert.ok(result.formattedDiagnostics.includes('Type'));
});
