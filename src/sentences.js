import { sentenceRuntime } from './runtime.js';
import { expression, typeExpression, signature, statement } from './expressions.js';
export { sentenceRuntime } from './runtime.js';

const identifier = /^[\p{L}_$][\p{L}\p{N}_$]*$/u;
const functionName = /^[\p{L}_$][\p{L}\p{N}_$]*(?:<.+>)?$/u;
const obsolete = /^(?:상수|변수|함수|반환|클래스|가져오기|내보내기|반복|비동기함수|스위치|선택|케이스|경우|인터페이스|열거형|시도|잡기|마침내|던지기|선언|추상)(?:\s|[({*])|^콘솔\.출력/u;

export function compileSentences(source, { includeRuntime = true, withMapping = false } = {}) {
  const output = [];
  const lineMap = [];
  let currentLine = 0;
  const push = code => { output.push(code); lineMap.push(...code.split('\n').map(() => currentLine)); };
  if (includeRuntime) push(sentenceRuntime);
  const frames = [{ indent: 0, kind: 'root' }];
  let pending = null;
  const lines = source.split(/\r?\n/);
  const inside = kind => {
    for (let i = frames.length - 1; i > 0; i--) {
      if (kind.includes(frames[i].kind)) return true;
      if (['function', 'method', 'generator', 'async'].includes(frames[i].kind)) return false;
    }
    return false;
  };
  for (let index = 0; index < lines.length; index++) {
    currentLine = index + 1;
    const raw = lines[index];
    const text = raw.trim();
    if (!text || text.startsWith('#')) continue;
    const fail = message => { throw new SyntaxError(`${index + 1}행: ${message}`); };
    if (/^문장으로 시작[.]?$/.test(text)) fail('시작 표기는 사용하지 않습니다. 첫 문장부터 작성하세요.');
    if (/^\s*\t/.test(raw)) fail('들여쓰기는 탭 대신 공백을 사용하세요.');
    const indent = raw.length - raw.trimStart().length;
    if (pending) {
      if (indent <= frames.at(-1).indent) fail('블록 안의 문장을 들여써 주세요.');
      frames.push({ ...pending, indent }); pending = null;
    } else if (indent > frames.at(-1).indent) fail('예상하지 못한 들여쓰기입니다.');
    let closed;
    while (indent < frames.at(-1).indent) {
      closed = frames.pop();
      push(closed.kind === 'case' ? 'break; }' : '}');
    }
    if (indent !== frames.at(-1).indent) fail('이전 블록과 들여쓰기를 맞춰 주세요.');
    const parent = frames.at(-1).kind;
    const open = (code, kind) => { push(code + ' {'); pending = { kind }; };
    const emit = code => push(code);
    const exp = value => expression(value);
    const top = () => { if (parent !== 'root') fail('가져오기·공개·타입 선언은 파일의 최상위에 작성하세요.'); };
    let m;
    try {
      if (closed?.kind === 'do' && !/^.+인 동안 반복한다$/.test(text)) fail('먼저 실행한다 블록 뒤에 「조건인 동안 반복한다」가 필요합니다.');
      if (obsolete.test(text)) fail('키워드형 문법은 제거됐습니다. 문장형으로 작성하세요.');
      if ((m = text.match(/^(비동기로 |차례로 )?(.+?)\((.*)\)를 정의한다:$/u))) {
        if (!functionName.test(m[2])) fail('함수 이름을 확인하세요.');
        const method = parent === 'class';
        const kind = m[1] === '비동기로 ' ? 'async' : m[1] === '차례로 ' ? 'generator' : method ? 'method' : 'function';
        const prefix = (kind === 'async' ? 'async ' : '') + (method ? (kind === 'generator' ? '*' : '') : (kind === 'generator' ? 'function* ' : 'function '));
        open(`${prefix}${m[2]}(${signature('(' + m[3] + ')', m[2])})`, kind);
      } else if ((m = text.match(/^생성할 때\((.*)\):$/u))) {
        if (parent !== 'class') fail('생성할 때는 클래스 안에서 사용하세요.');
        open(`constructor(${signature('(' + m[1] + ')')})`, 'method');
      } else if ((m = text.match(/^(.+?)을 읽으면:$/u))) {
        if (parent !== 'class' || !identifier.test(m[1])) fail('읽기 속성은 클래스 안에 작성하세요.');
        open(`get ${m[1]}()`, 'method');
      } else if ((m = text.match(/^(.+?)을 바꾸면\((.*)\):$/u))) {
        if (parent !== 'class' || !identifier.test(m[1])) fail('쓰기 속성은 클래스 안에 작성하세요.');
        open(`set ${m[1]}(${signature('(' + m[2] + ')')})`, 'method');
      } else if ((m = text.match(/^(?:(.+?)을 이어받아 )?(.+?) 클래스를 정의한다:$/u))) {
        if (!functionName.test(m[2])) fail('클래스 이름을 확인하세요.');
        open(`class ${m[2]}${m[1] ? ' extends ' + m[1] : ''}`, 'class');
      } else if ((m = text.match(/^(.+?) 자료형을 정의한다:$/u))) {
        top(); if (!functionName.test(m[1])) fail('자료형 이름을 확인하세요.'); open(`interface ${m[1]}`, 'interface');
      } else if ((m = text.match(/^(.+?) 타입은 (.+)이다$/u))) {
        top(); if (!functionName.test(m[1])) fail('타입 이름을 확인하세요.'); emit(`type ${m[1]} = ${typeExpression(m[2])};`);
      } else if ((m = text.match(/^(.+?) 열거값을 정의한다:$/u))) {
        top(); if (!identifier.test(m[1])) fail('열거값 이름을 확인하세요.'); open(`enum ${m[1]}`, 'enum');
      } else if (parent === 'enum') {
        if (!identifier.test(text)) fail('열거값 항목에는 이름 하나를 작성하세요.'); emit(text + ',');
      } else if ((m = text.match(/^(.+)에서 (.+?)(?:을|를) 가져온다$/u))) {
        top(); if (!/^(?:".*"|'.*')$/.test(m[1])) fail('모듈 경로를 따옴표로 감싸세요.');
        const binding = m[2].replace(/^모두를 (.+)로$/, '* as $1'); emit(`import ${binding} from ${m[1]};`);
      } else if ((m = text.match(/^(.+?)(?:을|를) 기본으로 공개한다$/u))) {
        top(); emit(`export default ${exp(m[1])};`);
      } else if ((m = text.match(/^(.+?)(?:을|를) 공개한다$/u))) {
        top(); emit(`export ${m[1].startsWith('{') ? m[1] : '{ ' + m[1] + ' }'};`);
      } else if ((m = text.match(/^("(?:[^"\\]|\\.)*") 버튼을 누르면:$/u))) {
        open(`if (버튼(${m[1]}))`, 'if');
      } else if ((m = text.match(/^각 (.+?)(?:을|를) (.+)에서:$/u))) {
        if (!identifier.test(m[1])) fail('반복 변수 이름을 확인하세요.'); open(`for (const ${m[1]} of ${exp(m[2])})`, 'loop');
      } else if ((m = text.match(/^만약 (.+) (?:이)?라면:$/u))) {
        open(`if (${exp(m[1])})`, 'if');
      } else if ((m = text.match(/^아니고 (.+) (?:이)?라면:$/u))) {
        if (!['if', 'elseif'].includes(closed?.kind)) fail('아니고 앞에는 조건 블록이 필요합니다.'); open(`else if (${exp(m[1])})`, 'elseif');
      } else if (text === '아니면:') {
        if (!['if', 'elseif'].includes(closed?.kind)) fail('아니면 앞에는 조건 블록이 필요합니다.'); open('else', 'else');
      } else if ((m = text.match(/^동안 (.+):$/u))) {
        open(`while (${exp(m[1])})`, 'loop');
      } else if (text === '먼저 실행한다:') {
        open('do', 'do');
      } else if ((m = text.match(/^(.+)인 동안 반복한다$/u))) {
        if (closed?.kind !== 'do') fail('먼저 실행한다 블록 뒤에 작성하세요.'); emit(`while (${exp(m[1])});`);
      } else if ((m = text.match(/^(.+)에 따라:$/u))) {
        open(`switch (${exp(m[1])})`, 'switch');
      } else if ((m = text.match(/^(.+)인 경우:$/u))) {
        if (parent !== 'switch') fail('경우는 값에 따라 블록 안에 작성하세요.'); open(`case ${exp(m[1])}:`, 'case');
      } else if (text === '그 밖의 경우:') {
        if (parent !== 'switch') fail('그 밖의 경우는 값에 따라 블록 안에 작성하세요.'); open('default:', 'case');
      } else if (text === '시도한다:') {
        open('try', 'try');
      } else if ((m = text.match(/^(.+?)(?:을|를) 잡으면:$/u))) {
        if (closed?.kind !== 'try' || !identifier.test(m[1])) fail('잡으면 앞에는 시도한다 블록이 필요합니다.'); open(`catch (${m[1]})`, 'catch');
      } else if (text === '마지막으로:') {
        if (!['try', 'catch'].includes(closed?.kind)) fail('마지막으로 앞에는 시도한다 또는 잡으면 블록이 필요합니다.'); open('finally', 'finally');
      } else if ((m = text.match(/^오류를 일으킨다 (.+)$/u))) {
        emit(`throw ${exp(m[1])};`);
      } else if ((m = text.match(/^(.+?)(?:은|는) (.+?)(이다|으로 고정한다)$/u))) {
        const binding = m[1].match(/^([\p{L}_$][\p{L}\p{N}_$]*)(?::\s*(.+))?$/u);
        if (!binding) fail('변수 이름과 타입을 확인하세요.');
        const type = binding[2] ? ': ' + typeExpression(binding[2]) : m[2] === '[]' ? ': any[]' : '';
        emit(`${parent === 'class' ? '' : m[3] === '으로 고정한다' ? 'const ' : 'let '}${binding[1]}${type} = ${exp(m[2])};`);
      } else if (['class', 'interface'].includes(parent) && (m = text.match(/^([\p{L}_$][\p{L}\p{N}_$]*\??): (.+)$/u))) {
        emit(`${m[1]}: ${typeExpression(m[2])};`);
      } else if ((m = text.match(/^돌려주기(?: (.+))?$/u))) {
        if (!frames.some(f => ['function', 'method', 'async', 'generator'].includes(f.kind))) fail('돌려주기는 함수 안에서 사용하세요.'); emit(`return ${m[1] ? exp(m[1]) : ''};`);
      } else if ((m = text.match(/^내주기 (.+)$/u))) {
        if (!inside(['generator'])) fail('내주기는 차례로 정의한 함수 안에서 사용하세요.'); emit(`yield ${exp(m[1])};`);
      } else if (text === '멈추기' || text === '계속하기') {
        if (!inside(text === '멈추기' ? ['loop', 'do', 'case'] : ['loop', 'do'])) fail('반복 블록 안에서 사용하세요.'); emit(text === '멈추기' ? 'break;' : 'continue;');
      } else if (text.endsWith(':')) fail('지원하지 않는 블록 문장입니다.');
      else emit(statement(exp(text)));
    } catch (error) {
      if (error.message.startsWith(`${index + 1}행:`)) throw error;
      fail(error.message);
    }
  }
  if (pending) throw new SyntaxError('마지막 블록에 실행할 문장이 필요합니다.');
  while (frames.length > 1) {
    const frame = frames.pop();
    if (frame.kind === 'do') throw new SyntaxError('먼저 실행한다 블록 뒤에 반복 조건이 필요합니다.');
    push(frame.kind === 'case' ? 'break; }' : '}');
  }
  const code = output.join('\n');
  return withMapping ? { code, lineMap } : code;
}
