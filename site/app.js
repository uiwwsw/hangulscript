import { tools, uiExample } from './examples.js';
const $ = id => document.getElementById(id);
const examples = {
  scores: `# 우리 반 점수를 분석해 봅시다
점수들은 [75, 92, 88, 64, 97]이다
합격자들은 []이다

각 점수를 점수들에서:
    만약 점수 >= 80 이라면:
        추가(합격자들, 점수)

출력("합격 점수:", 정렬(합격자들))
출력("평균 점수:", 합계(점수들) / 길이(점수들))
출력("합격 인원:", 길이(합격자들))`,
  hello: `이름은 "세상"이다

인사(누구)를 정의한다:
    돌려주기 "안녕, " + 누구 + "!"

출력(인사(이름))`,
  loop: `단은 7이다
각 수를 범위(1, 10)에서:
    출력(단 + " × " + 수 + " = " + 단 * 수)`
};
function selectExample() {
  const key = $('example').value;
  $('source').value = tools[key] ? uiExample(key) : examples[key];
  uiValues = {}; uiAction = ''; $('preview-content').replaceChildren();
  schedule();
  // Built-in controls share the example schema; execute code only on a user's action.
  if (tools[key]) renderUI([
    ...tools[key].fields.map(field => ({ type: field.options ? 'select' : field.type, label: field.label, value: field.value, ...(field.options ? { options: field.options } : {}) })),
    { type: 'button', label: key === 'text' ? '정리하기' : '계산하기' }
  ]);
}
let uiValues = {};
let uiAction = '';
let pendingUI;
let runVersion = 0;
let javascript = '';
let frame;
let timer;
let handshake;
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
    $('compiled').value = $('output-format').value === 'javascript' ? result.displayJavascript : result.display;
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
  editVersion++; runVersion++;
  stop(); clearTimeout(debounce);
  $('status').textContent = '입력 중…';
  debounce = setTimeout(transform, 180);
}
function stop() {
  clearTimeout(timer); clearInterval(handshake);
  frame?.remove(); frame = null; ready = false;
  $('run').disabled = false;
}
async function run(action = '') {
  const execution = ++runVersion;
  uiAction = typeof action === 'string' ? action : '';
  pendingUI = null;
  stop(); clearTimeout(debounce);
  const version = editVersion;
  $('run').disabled = true;
  if (!await transform() || version !== editVersion || execution !== runVersion) { $('run').disabled = false; return; }
  outputLines = 0;
  $('output').textContent = ''; $('status').textContent = '실행 중…'; $('run').disabled = true;
  token = crypto.randomUUID();
  frame = document.createElement('iframe');
  frame.hidden = true; frame.sandbox = 'allow-scripts'; frame.src = '/runner.html';
  document.body.append(frame);
  handshake = setInterval(() => frame?.contentWindow.postMessage({ type: 'hello' }, '*'), 250);
  timer = setTimeout(() => { stop(); $('status').textContent = '실행 환경 로딩 실패'; $('output').textContent = '실행 환경을 불러오지 못했습니다. 다시 실행해 주세요.'; }, 10000);
}
window.addEventListener('message', event => {
  if (!frame || event.source !== frame.contentWindow) return;
  if (event.data?.type === 'ready' && !ready) {
    ready = true; clearTimeout(timer); clearInterval(handshake);
    timer = setTimeout(() => { stop(); $('status').textContent = '실행 시간 초과'; $('output').textContent += '\n2초 제한으로 실행을 종료했습니다.'; }, 2500);
    frame.contentWindow.postMessage({ type: 'run', code: javascript, token, values: uiValues, action: uiAction }, '*'); return;
  }
  if (event.data?.token !== token) return;
  if (event.data.type === 'ui') {
    try { pendingUI = JSON.parse(event.data.text); } catch { pendingUI = null; }
  }
  if (event.data.type === 'log' && outputLines++ < 100) $('output').textContent += String(event.data.text).slice(0, 1000) + '\n';
  if (event.data.type === 'done' || event.data.type === 'error') {
    const failure = event.data.type === 'error';
    if (!failure && pendingUI) renderUI(pendingUI);
    if (failure) $('output').textContent += String(event.data.text);
    if (!$('output').textContent) $('output').textContent = pendingUI?.length ? '화면을 업데이트했습니다. 도구의 입력값을 바꾸고 버튼을 눌러 보세요.' : '실행을 마쳤습니다. 출력할 값이 없습니다.';
    document.querySelector('.console').classList.toggle('ui-mode', !failure && !!pendingUI?.length);
    $('status').textContent = failure ? '실행 오류' : '실행 완료'; stop();
  }
});
$('source').value = uiExample('calculator');
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
$('source').addEventListener('input', () => { uiValues = {}; $('preview-content').replaceChildren(); schedule(); });
$('source').addEventListener('keydown', event => {
  if (event.key === 'Tab') { event.preventDefault(); $('source').setRangeText('    ', $('source').selectionStart, $('source').selectionEnd, 'end'); schedule(); }
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') run();
});
$('run').addEventListener('click', run);
$('output-format').addEventListener('change', () => {
  if (lastResult) $('compiled').value = $('output-format').value === 'javascript' ? lastResult.displayJavascript : lastResult.display;
});
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
  const link = document.createElement('a'); link.href = url; link.download = 'main.hgs'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
if (!location.hash.startsWith('#code=')) selectExample(); else transform();

function renderUI(elements) {
  if (!Array.isArray(elements) || elements.length > 40) return;
  const content = document.createDocumentFragment();
  for (const item of elements) {
    if (!item || typeof item.label !== 'string' || item.label.length > 2000) continue;
    const label = document.createElement('label');
    label.textContent = item.label;
    if (['number', 'text', 'select'].includes(item.type)) {
      const input = document.createElement(item.type === 'select' ? 'select' : 'input');
      if (item.type === 'select') {
        if (!Array.isArray(item.options) || item.options.length > 30) continue;
        for (const value of item.options) { const option = document.createElement('option'); option.textContent = option.value = String(value).slice(0, 2000); input.append(option); }
      } else { input.type = item.type; if (item.type === 'number') input.step = 'any'; else input.maxLength = 2000; }
      input.value = String(item.value ?? '').slice(0, 2000); input.required = true;
      input.addEventListener('input', () => { uiValues[item.label] = input.value; });
      label.append(input); content.append(label);
    } else if (item.type === 'button') {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'primary'; button.textContent = item.label;
      button.addEventListener('click', () => { if ($('preview-content').reportValidity()) run(item.label); }); content.append(button);
    } else if (item.type === 'result') {
      const card = document.createElement('div'); card.className = 'preview-result';
      const title = document.createElement('span'); title.textContent = item.label;
      const value = document.createElement('strong'); value.textContent = String(item.value ?? '').slice(0, 2000);
      card.append(title, value); content.append(card);
    }
  }
  $('preview-content').replaceChildren(content);
  if (!elements.length) $('preview-content').textContent = '이 예제는 아래 실행 결과에 출력합니다. 화면 예제를 선택하면 입력창과 버튼을 볼 수 있습니다.';
}
$('preview-content').addEventListener('submit', event => event.preventDefault());
