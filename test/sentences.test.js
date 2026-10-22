import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import vm from 'node:vm';
import { compileSource, lintSource } from '../src/index.js';

const sample = `점수들은 [75, 92, 88]이다
통과는 []이다
각 점수를 점수들에서:
    만약 점수 >= 80 이라면:
        통과.push(점수)
    아니면:
        출력("다음 기회에")
인사(이름)를 정의한다:
    돌려주기 "안녕, " + 이름
출력(인사("철수"))
출력(합계(점수들), 정렬(점수들), 길이(점수들), 범위(3))`;

test('sentence dialect compiles and executes loops, conditions, functions and helpers', () => {
  const logs = [];
  const code = ts.transpileModule(compileSource(sample), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { console: { log: (...args) => logs.push(JSON.stringify(args)) } }, { timeout: 1000 });
  assert.deepEqual(logs, ['["다음 기회에"]', '["안녕, 철수"]', '[255,[75,88,92],3,[0,1,2]]']);
});

test('sentence syntax gives source line on invalid indentation and rejects empty blocks', () => {
  assert.throws(() => compileSource('만약 참 이라면:\n출력(1)'), /2행/);
  assert.throws(() => compileSource('동안 참:'), /마지막 블록/);
});

test('standard helpers typecheck and range rejects unbounded allocation', () => {
  assert.equal(lintSource('출력(합계([1, 2]), 범위(3))').hasErrors, false);
  const code = ts.transpileModule(compileSource('출력(범위(0, 3, 0))'), {}).outputText;
  assert.throws(() => vm.runInNewContext(code), /0이 아닌/);
});


test('sentence scores example passes strict type checking', () => {
  assert.equal(lintSource(sample).hasErrors, false);
});
