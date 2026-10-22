import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildSource } from '../src/index.js';
import { createUIBridge } from '../src/ui.js';
import { tools, uiExample } from '../site/examples.js';
import hangulscript from '../src/vite.js';

function execute(source, values = {}, action = '') {
  const bridge = createUIBridge(values, action);
  vm.runInNewContext(buildSource(source).javascript, { __hangulUI: bridge, console }, { timeout: 1000 });
  return bridge.snapshot();
}

test('UI examples create controls, respond to input and button actions', () => {
  for (const key of Object.keys(tools)) {
    const initial = execute(uiExample(key));
    assert.ok(initial.some(item => item.type === 'button'));
    assert.ok(!initial.some(item => item.type === 'result'));
  }
  const result = execute(uiExample('calculator'), { '첫 번째 수': 12, '두 번째 수': 3 }, '계산하기');
  assert.equal(result.find(item => item.type === 'result').value, '4');
  const zero = execute(uiExample('calculator'), { '두 번째 수': 0 }, '계산하기');
  assert.match(zero.find(item => item.type === 'result').value, /0으로/);
  const discount = execute(uiExample('discount'), { '가격 (원)': 10000, '할인율 (%)': 20 }, '계산하기');
  assert.equal(discount.find(item => item.label === '결제 금액:').value, '8000 원');
  const invalid = execute(uiExample('discount'), { '할인율 (%)': 101 }, '계산하기');
  assert.match(invalid.find(item => item.type === 'result').value, /0~100/);
  assert.equal(execute(uiExample('statistics'), {}, '계산하기').find(item => item.label === '평균:').value, '25');
  assert.match(execute(uiExample('text'), {}, '정리하기').find(item => item.label === '중복 없이:').value, /사과 · 바나나 · 포도/);
});

test('UI protocol bounds descriptors and rejects invalid input without interpreting HTML', () => {
  assert.throws(() => createUIBridge({ 값: '' }).number('값'), /올바른 숫자/);
  assert.throws(() => createUIBridge().select('선택', []), /1~30/);
  const bridge = createUIBridge();
  bridge.show('결과', '<img src=x onerror=alert(1)>');
  assert.equal(bridge.snapshot()[0].value, '<img src=x onerror=alert(1)>');
  assert.throws(() => bridge.button('결과'), /중복/);
  for (let i = 1; i < 40; i++) bridge.show(String(i), i);
  assert.throws(() => bridge.show('초과', 0), /최대 40/);
});

test('Vite plugin emits importable JS for shared React and Vue business logic', async () => {
  const plugin = hangulscript();
  assert.equal(plugin.transform('', '/app.tsx'), null);
  const result = plugin.transform('할인(가격: 숫자, 비율: 숫자)를 정의한다:\n    돌려주기 가격 * (1 - 비율 / 100)\n할인을 공개한다', '/discount.hgs');
  assert.doesNotMatch(result.code, /가격: number/);
  const module = await import('data:text/javascript;base64,' + Buffer.from(result.code).toString('base64'));
  assert.equal(module.할인(10000, 20), 8000);
});
