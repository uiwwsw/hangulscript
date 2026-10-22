import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import { tools, defaults } from '../site/examples.js';
import { compileSource, buildSource } from '../src/index.js';
const execute = source => {
  const logs = [];
  const code = ts.transpileModule(compileSource(source), {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code, { console: { log: (...args) => logs.push(args.map(String).join(' ')) } }, {timeout:1000});
  return logs;
};
test('practical tools produce useful default results', () => {
  assert.deepEqual(execute(tools.calculator.source(defaults(tools.calculator))), ['계산 결과: 4']);
  assert.deepEqual(execute(tools.discount.source(defaults(tools.discount))), ['할인액: 4800 원','결제 금액: 27200 원']);
  assert.deepEqual(execute(tools.statistics.source(defaults(tools.statistics))), ['개수: 4','합계: 100','평균: 25','최솟값: 10','최댓값: 40']);
  assert.deepEqual(execute(tools.text.source(defaults(tools.text))), ['중복 없이: 사과 · 바나나 · 포도','단어 수: 3']);
});
test('invalid inputs and calculator division by zero give explicit outcomes', () => {
  assert.deepEqual(execute(tools.calculator.source({left:1,right:0,operation:'나누기'})), ['계산 결과: 0으로 나눌 수 없습니다']);
  assert.throws(() => execute(tools.statistics.source({numbers:'10, , 30'})), /빈 문자열/);
  assert.throws(() => execute('문장으로 시작\n출력(평균([]))'), /빈 목록/);
  assert.deepEqual(execute(tools.discount.source({price:100,rate:200})), ['가격은 0 이상, 할인율은 0~100 사이로 입력하세요']);
});
test('build emits JS and declarations with exported function types', () => {
  const built = buildSource('문장으로 시작\n더함(가: 숫자, 나: 숫자)를 정의한다:\n    돌려주기 가 + 나\n내보내기 { 더함 }');
  assert.match(built.javascript,/function 더함\(가, 나\)/);
  assert.match(built.declaration,/declare function 더함\(가: number, 나: number\): number/);
  assert.match(built.declaration,/export \{ 더함 \}/);
  assert.doesNotMatch(built.javascript,/: number/);
});
