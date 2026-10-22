window.addEventListener('message', function receive(event) {
  if (event.source !== parent || event.data?.type !== 'run') return;
  window.removeEventListener('message', receive);
  const { code, token } = event.data;
  const send = (type, text) => parent.postMessage({ type, text, token }, '*');
  // User code only receives the Worker's global scope, never this iframe's scope.
  const bootstrap = `const report = self.postMessage.bind(self);
const render = value => { try { return typeof value === 'string' ? value : JSON.stringify(value); } catch { return String(value); } };
let count = 0;
console.log = console.info = console.warn = console.error = (...values) => {
  if (++count <= 100) report({type:'log',text:values.map(render).join(' ').slice(0,3000)});
};
self.onmessage = async event => {
  try {
    const execute = new Function(event.data);
    await execute();
    report({type:'done'});
  } catch(error) { report({type:'error',text:String(error?.message || error)}); }
};`;
  const url = URL.createObjectURL(new Blob([bootstrap], { type: 'text/javascript' }));
  try {
    const worker = new Worker(url);
    const timer = setTimeout(() => { worker.terminate(); URL.revokeObjectURL(url); send('error', '2초 제한으로 실행을 종료했습니다.'); }, 2000);
    worker.onmessage = ({ data }) => {
      if (!['log', 'done', 'error'].includes(data?.type)) return;
      send(data.type, String(data.text ?? ''));
      if (data.type !== 'log') { clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); }
    };
    worker.onerror = () => { clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); send('error', '실행 환경에서 오류가 발생했습니다.'); };
    worker.postMessage(code);
  } catch(error) { URL.revokeObjectURL(url); send('error', error.message); }
});
parent.postMessage({ type: 'ready' }, '*');
