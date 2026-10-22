import ts from 'typescript';
import { compileSource } from '../src/transformer.js';
import { sentenceRuntime } from '../src/sentences.js';
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
let javascript = '';
let frame;
let timer;
let token;
let ready = false;
function transform() {
  try {
    if ($('source').value.length > 30000) throw new Error('코드는 30000자까지 입력할 수 있습니다.');
    const compiled = compileSource($('source').value);
    $('compiled').value = ts.createPrinter().printFile(ts.createSourceFile('main.ts', compiled.replace(sentenceRuntime, '// 출력·길이·합계 등 기본 함수는 실행 시 포함됩니다.\n'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
    const result = ts.transpileModule(compiled, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None }, reportDiagnostics: true });
    const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
    if (errors.length) throw new Error(errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
    javascript = result.outputText;
    $('status').textContent = '변환 완료 · 실행할 준비가 됐어요';
    return true;
  } catch (error) { javascript = ''; $('compiled').value = ''; $('status').textContent = '문법을 확인해 주세요'; $('output').textContent = error.message; return false; }
}
function stop() {
  clearTimeout(timer);
  frame?.remove(); frame = null; ready = false;
  $('run').disabled = false;
}
function run() {
  stop();
  if (!transform()) return;
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
  if (event.data.type === 'log') $('output').textContent += String(event.data.text).slice(0, 3000) + '\n';
  if (event.data.type === 'done' || event.data.type === 'error') {
    const failure = event.data.type === 'error';
    if (failure) $('output').textContent += String(event.data.text);
    if (!$('output').textContent) $('output').textContent = '실행을 마쳤습니다. 출력할 값이 없습니다.';
    $('status').textContent = failure ? '실행 오류' : '실행 완료'; stop();
  }
});
$('source').value = examples.scores;
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
$('example').addEventListener('change', () => { stop(); $('source').value = examples[$('example').value]; transform(); });
$('source').addEventListener('input', () => { stop(); transform(); });
$('source').addEventListener('keydown', event => {
  if (event.key === 'Tab') { event.preventDefault(); $('source').setRangeText('    ', $('source').selectionStart, $('source').selectionEnd, 'end'); transform(); }
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
transform();
