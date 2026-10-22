import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { compileSource } from '../src/transformer.js';
import { emittedCode } from '../site/emitted-code.js';
import { uiExample } from '../site/examples.js';
import { createUIBridge } from '../src/ui.js';
function emit(source) { return emittedCode(compileSource(source)); }
function execute(javascript, extra = {}) {
  const logs = [];
  vm.runInNewContext(javascript, { console: { log: (...args) => logs.push(args) }, ...extra }, { timeout: 1000 });
  return logs;
}
test('displayed JavaScript is the executed program and runs without hidden helpers', () => {
  const result = emit('이름은 "세상"이다\n출력("안녕, " + 이름)');
  assert.equal(result.javascript, result.displayJavascript);
  assert.match(result.javascript, /console\.log/);
  assert.doesNotMatch(result.javascript, /function 출력|function 합계|출력\(/);
  assert.deepEqual(execute(result.displayJavascript), [['안녕, 세상']]);
  const collections = emit('점수들은 [3, 1, 2]이다\n출력(평균(점수들), 정렬(점수들))');
  assert.match(collections.javascript, /function 합계/);
  assert.match(collections.javascript, /function 정렬비교/);
  assert.doesNotMatch(collections.javascript, /function 집합|function 화면연결/);
  assert.equal(JSON.stringify(execute(collections.displayJavascript)), '[[2,[1,2,3]]]');
});
test('output aliases, object properties, literals and locally shadowed names retain behavior', () => {
  const alias = emit('기록은 출력이다\n모음은 { 출력 }이다\n기록("출력(문자열)")\n모음.출력("속성")');
  assert.match(alias.javascript, /function 출력/);
  assert.deepEqual(execute(alias.javascript), [['출력(문자열)'], ['속성']]);
  const local = emit('실행(console: 숫자)를 정의한다:\n    출력(console)\n실행(7)');
  assert.match(local.javascript, /function 출력/);
  assert.deepEqual(execute(local.javascript), [[7]]);
});
test('emitted UI program retains the host bridge dependencies', () => {
  const bridge = createUIBridge({}, '계산하기');
  const result = emit(uiExample('calculator'));
  execute(result.displayJavascript, { __hangulUI: bridge });
  assert.equal(bridge.snapshot().find(item => item.type === 'result').value, '4');
});
