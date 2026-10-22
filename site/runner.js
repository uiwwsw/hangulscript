import { createUIBridge } from '../src/ui.js';
window.addEventListener('message', function receive(event) {
  if (event.source !== parent) return;
  if (event.data?.type === 'hello') { parent.postMessage({ type: 'ready' }, '*'); return; }
  if (event.data?.type !== 'run') return;
  window.removeEventListener('message', receive);
  const { code, token, values, action } = event.data;
  const send = (type, text) => parent.postMessage({ type, text, token }, '*');
  // User code only receives the Worker's global scope, never this iframe's scope.
  const bootstrap = `const report = self.postMessage.bind(self);
const createUIBridge = ${createUIBridge.toString()};
const render = value => { try { return typeof value === 'string' ? value : JSON.stringify(value); } catch { return String(value); } };
let count = 0;
console.log = console.info = console.warn = console.error = (...values) => {
  if (++count <= 100) report({type:'log',text:values.map(render).join(' ').slice(0,3000)});
};
self.onmessage = async event => {
  try {
    const { code, values, action } = event.data;
    const bridge = createUIBridge(values, action);
    self.__hangulUI = bridge;
    const execute = new Function(code);
    await execute();
    report({type:'ui',text:JSON.stringify(bridge.snapshot())});
    report({type:'done'});
  } catch(error) { report({type:'error',text:String(error?.message || error)}); }
};`;
  const url = URL.createObjectURL(new Blob([bootstrap], { type: 'text/javascript' }));
  try {
    const worker = new Worker(url);
    const timer = setTimeout(() => { worker.terminate(); URL.revokeObjectURL(url); send('error', '2초 제한으로 실행을 종료했습니다.'); }, 2000);
    let messages = 0;
    worker.onmessage = ({ data }) => {
      if (++messages > 150 || String(data?.text ?? '').length > 100000) { clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); send('error', '화면 또는 출력 크기 제한을 초과했습니다.'); return; }
      if (!['log', 'ui', 'done', 'error'].includes(data?.type)) return;
      send(data.type, String(data.text ?? ''));
      if (['done', 'error'].includes(data.type)) { clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); }
    };
    worker.onerror = () => { clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); send('error', '실행 환경에서 오류가 발생했습니다.'); };
    worker.postMessage({code, values, action});
  } catch(error) { URL.revokeObjectURL(url); send('error', error.message); }
});
parent.postMessage({ type: 'ready' }, '*');
