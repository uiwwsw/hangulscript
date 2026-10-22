import { tools, defaults } from './examples.js';
const $ = id => document.getElementById(id);
const examples = {
  scores: `문장으로 시작
# 우리 반 점수를 분석해 봅시다
점수들은 [75, 92, 88, 64, 97]이다
합격자들은 []이다

각 점수를 점수들에서:
    만약 점수 >= 80 이라면:
        추가(합격자들, 점수)

출력("합격 점수:", 정렬(합격자들))
출력("평균 점수:", 합계(점수들) / 길이(점수들))
출력("합격 인원:", 길이(합격자들))`,
  hello: `문장으로 시작
이름은 "세상"이다

인사(누구)를 정의한다:
    돌려주기 "안녕, " + 누구 + "!"

출력(인사(이름))`,
  loop: `문장으로 시작
단은 7이다
각 수를 범위(1, 10)에서:
    출력(단 + " × " + 수 + " = " + 단 * 수)`,
  legacy: `상수 이름 = "철수";
함수 인사(사람: 문자열): 문자열 {
  반환 "안녕, " + 사람;
}
콘솔.출력(인사(이름));`
};
function selectExample() {
  const key = $('example').value;
  const tool = tools[key];
  $('tool-inputs').replaceChildren();
  if (!tool) { $('source').value = examples[key]; schedule(); return; }
  for (const field of tool.fields) {
    const label = document.createElement('label'); label.textContent = field.label;
    const input = document.createElement(field.options ? 'select' : 'input');
    if (field.options) for (const text of field.options) { const option = document.createElement('option'); option.textContent = option.value = text; input.append(option); }
    else { input.type = field.type; if (field.type === 'number') input.step = 'any'; }
    input.name = field.key; input.value = field.value; input.required = true;
    if (!field.options && field.type === 'text') input.maxLength = 2000;
    label.append(input); $('tool-inputs').append(label);
  }
  $('tool-inputs').hidden = false;
  const render = () => {
    const values = {};
    for (const field of tool.fields) {
      const input = $('tool-inputs').elements.namedItem(field.key);
      if (field.type === 'number') {
        if (input.value.trim() === '' || !Number.isFinite(Number(input.value))) { $('status').textContent = '올바른 숫자를 입력하세요'; $('run').disabled = true; return; }
        values[field.key] = Number(input.value);
      } else values[field.key] = input.value;
    }
    $('source').value = tool.source(values); schedule();
  };
  $('tool-inputs').oninput = render;
  render();
}
$('tool-inputs').addEventListener('submit', e => e.preventDefault());
let javascript = '';
let frame;
let timer;
let token;
let ready = false;
let compiler;
let nextRequest = 0;
let editVersion = 0;
let debounce;
let lastSource;
let lastResult;
let outputLines = 0;
const requests = new Map();
function compile(source) {
  if (source === lastSource) return Promise.resolve(lastResult);
  if (!compiler) {
    compiler = new Worker('/compiler-worker.js', { type: 'module' });
    compiler.onmessage = ({ data }) => {
      const request = requests.get(data.id);
      if (!request) return;
      requests.delete(data.id);
      data.error ? request.reject(new Error(data.error)) : request.resolve(data);
    };
    compiler.onerror = () => {
      for (const request of requests.values()) request.reject(new Error('변환기를 불러오지 못했습니다. 페이지를 새로고침해 주세요.'));
      requests.clear(); compiler.terminate(); compiler = null;
    };
  }
  return new Promise((resolve, reject) => {
    const id = ++nextRequest;
    requests.set(id, { resolve, reject });
    compiler.postMessage({ id, source });
  });
}
async function transform() {
  const version = editVersion;
  const source = $('source').value;
  $('status').textContent = '변환 중…';
  try {
    const result = await compile(source);
    if (version !== editVersion) return false;
    lastSource = source; lastResult = result;
    $('compiled').value = result.display;
    javascript = result.javascript;
    $('status').textContent = `변환 완료 · ${result.duration.toFixed(1)}ms`;
    return true;
  } catch (error) {
    if (version !== editVersion) return false;
    javascript = ''; $('compiled').value = '';
    $('status').textContent = '문법을 확인해 주세요'; $('output').textContent = error.message;
    return false;
  }
}
function schedule() {
  editVersion++;
  stop(); clearTimeout(debounce);
  $('status').textContent = '입력 중…';
  debounce = setTimeout(transform, 180);
}
function stop() {
  clearTimeout(timer);
  frame?.remove(); frame = null; ready = false;
  $('run').disabled = false;
}
async function run() {
  if (!$('tool-inputs').hidden && !$('tool-inputs').reportValidity()) return;
  stop(); clearTimeout(debounce);
  const version = editVersion;
  $('run').disabled = true;
  if (!await transform() || version !== editVersion) { $('run').disabled = false; return; }
  outputLines = 0;
  $('output').textContent = ''; $('status').textContent = '실행 중…'; $('run').disabled = true;
  token = crypto.randomUUID();
  frame = document.createElement('iframe');
  frame.hidden = true; frame.sandbox = 'allow-scripts'; frame.src = '/runner.html';
  document.body.append(frame);
  timer = setTimeout(() => { stop(); $('status').textContent = '실행 시간 초과'; $('output').textContent += '\n2초 제한으로 실행을 종료했습니다.'; }, 2500);
}
window.addEventListener('message', event => {
  if (!frame || event.source !== frame.contentWindow) return;
  if (event.data?.type === 'ready' && !ready) { ready = true; frame.contentWindow.postMessage({ type: 'run', code: javascript, token }, '*'); return; }
  if (event.data?.token !== token) return;
  if (event.data.type === 'log' && outputLines++ < 100) $('output').textContent += String(event.data.text).slice(0, 1000) + '\n';
  if (event.data.type === 'done' || event.data.type === 'error') {
    const failure = event.data.type === 'error';
    if (failure) $('output').textContent += String(event.data.text);
    if (!$('output').textContent) $('output').textContent = '실행을 마쳤습니다. 출력할 값이 없습니다.';
    $('status').textContent = failure ? '실행 오류' : '실행 완료'; stop();
  }
});
$('source').value = tools.calculator.source(defaults(tools.calculator));
try {
  if (location.hash.startsWith('#code=')) {
    const encoded = location.hash.slice(6);
    if (encoded.length > 160000) throw new Error();
    const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (source.length > 30000) throw new Error();
    $('source').value = source;
  }
} catch { $('output').textContent = '공유 링크를 읽을 수 없어 기본 예제를 열었습니다.'; }
$('example').addEventListener('change', selectExample);
$('source').addEventListener('input', () => { $('tool-inputs').hidden = true; schedule(); });
$('source').addEventListener('keydown', event => {
  if (event.key === 'Tab') { event.preventDefault(); $('source').setRangeText('    ', $('source').selectionStart, $('source').selectionEnd, 'end'); schedule(); }
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') run();
});
$('run').addEventListener('click', run);
$('share').addEventListener('click', async () => {
  try {
    const bytes = new TextEncoder().encode($('source').value);
    const encoded = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
    await navigator.clipboard.writeText(location.origin + '/#code=' + encoded);
    $('status').textContent = '공유 링크를 복사했습니다';
  } catch { $('status').textContent = '클립보드 권한을 확인해 주세요'; }
});
$('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([$('source').value], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'main.ks'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
if (!location.hash.startsWith('#code=')) selectExample(); else transform();
