// 문장형 v0.1: deterministic indentation grammar, not natural-language inference.
export function isSentenceSource(source) {
  return source.split(/\r?\n/).some(line => /^\s*(?:문장으로 시작\s*$|[\p{L}_$][\p{L}\p{N}_$]*(?:은|는)\s+.+이다\s*$|각 .+에서:\s*$|[\p{L}_$][\p{L}\p{N}_$]*\(.*\)를 정의한다:\s*$)/u.test(line));
}

export const sentenceRuntime = `
function 출력(...값: unknown[]): void { console.log(...값); }
function 길이(값: string | readonly unknown[]): number { return 값.length; }
function 추가<T>(목록: T[], 값: T): void { 목록.push(값); }
function 포함<T>(목록: readonly T[], 값: T): boolean { return 목록.includes(값); }
function 나누기(글: string, 구분: string): string[] { return 글.split(구분); }
function 잇기(목록: readonly unknown[], 구분 = ""): string { return 목록.join(구분); }
function 합계(값: readonly number[]): number { return 값.reduce((합, 항목) => 합 + 항목, 0); }
function 숫자로(값: string | number): number {
  if (typeof 값 === "string" && 값.trim() === "") throw new Error("빈 문자열은 숫자로 바꿀 수 없습니다.");
  const 결과 = Number(값);
  if (!Number.isFinite(결과)) throw new Error("유한한 숫자를 입력하세요.");
  return 결과;
}
function 다듬기(글: string): string { return 글.trim(); }
function 반올림(값: number, 자리 = 0): number {
  if (!Number.isFinite(값) || !Number.isInteger(자리) || 자리 < -10 || 자리 > 10) throw new Error("유한한 수와 -10~10 사이의 정수 자리가 필요합니다.");
  return Math.round(값 * 10 ** 자리) / 10 ** 자리;
}
function 평균(목록: readonly number[]): number {
  if (!목록.length) throw new Error("빈 목록의 평균을 구할 수 없습니다.");
  return 합계(목록) / 목록.length;
}
function 최솟값(목록: readonly number[]): number {
  if (!목록.length) throw new Error("빈 목록의 최솟값을 구할 수 없습니다.");
  let 결과 = 목록[0]; for (const 항목 of 목록) if (항목 < 결과) 결과 = 항목;
  return 결과;
}
function 최댓값(목록: readonly number[]): number {
  if (!목록.length) throw new Error("빈 목록의 최댓값을 구할 수 없습니다.");
  let 결과 = 목록[0]; for (const 항목 of 목록) if (항목 > 결과) 결과 = 항목;
  return 결과;
}
function 정렬(값: readonly number[]): number[] { return [...값].sort((가, 나) => 가 - 나); }
function 범위(시작: number, 끝?: number, 간격 = 1): number[] {
  if (끝 === undefined) { 끝 = 시작; 시작 = 0; }
  if (!Number.isFinite(시작) || !Number.isFinite(끝) || !Number.isFinite(간격) || 간격 === 0) throw new Error("범위에는 유한한 수와 0이 아닌 간격이 필요합니다.");
  const 개수 = Math.max(0, Math.ceil((끝 - 시작) / 간격));
  if (개수 > 100000) throw new Error("범위는 최대 100000개까지 만들 수 있습니다.");
  return Array.from({ length: 개수 }, (_, 순서) => 시작 + 순서 * 간격);
}
`;

export function compileSentences(source, { includeRuntime = true } = {}) {
  const output = includeRuntime ? [sentenceRuntime] : [];
  const indents = [0];
  let needsIndent = false;
  const lines = source.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index];
    const text = raw.trim();
    if (!text || text === '문장으로 시작' || text.startsWith('#')) continue;
    const fail = message => { throw new SyntaxError(`${index + 1}행: ${message}`); };
    if (/^\s*\t/.test(raw)) fail('들여쓰기는 탭 대신 공백을 사용하세요.');
    const indent = raw.length - raw.trimStart().length;
    if (needsIndent) {
      if (indent <= indents.at(-1)) fail('블록 안의 문장을 들여써 주세요.');
      indents.push(indent);
    } else if (indent > indents.at(-1)) fail('예상하지 못한 들여쓰기입니다.');
    while (indent < indents.at(-1)) { indents.pop(); output.push('}'); }
    if (indent !== indents.at(-1)) fail('이전 블록과 들여쓰기를 맞춰 주세요.');
    needsIndent = false;
    let match;
    if ((match = text.match(/^(.+\))를 정의한다:$/u))) {
      // Unannotated parameters are intentionally dynamic, like Python.
      const signature = match[1].replace(/\((.*)\)$/, (_, params) => '(' + params.split(',').filter(x => x.trim()).map(x => x.includes(':') ? x.trim() : `${x.trim()}: any`).join(', ') + ')');
      output.push(`function ${signature} {`); needsIndent = true;
    } else if ((match = text.match(/^각 (.+?)(?:을|를) (.+)에서:$/u))) {
      if (!/^[\p{L}_$][\p{L}\p{N}_$]*$/u.test(match[1])) fail('반복 변수 이름을 확인하세요.');
      output.push(`for (const ${match[1]} of ${match[2]}) {`); needsIndent = true;
    } else if ((match = text.match(/^만약 (.+) (?:이)?라면:$/u))) {
      output.push(`if (${match[1]}) {`); needsIndent = true;
    } else if ((match = text.match(/^아니고 (.+) (?:이)?라면:$/u))) {
      if (output.at(-1) !== '}') fail('아니고 앞에는 조건 블록이 필요합니다.');
      output.push(`else if (${match[1]}) {`); needsIndent = true;
    } else if (text === '아니면:') {
      if (output.at(-1) !== '}') fail('아니면 앞에는 조건 블록이 필요합니다.');
      output.push('else {'); needsIndent = true;
    } else if ((match = text.match(/^동안 (.+):$/u))) {
      output.push(`while (${match[1]}) {`); needsIndent = true;
    } else if ((match = text.match(/^(.+?)(?:은|는) (.+)이다$/u))) {
      if (!/^[\p{L}_$][\p{L}\p{N}_$]*$/u.test(match[1])) fail('변수 이름을 확인하세요.');
      output.push(`let ${match[1]}${match[2].trim() === '[]' ? ': any[]' : ''} = ${match[2]};`);
    } else if ((match = text.match(/^돌려주기(?: (.+))?$/u))) {
      output.push(`return ${match[1] ?? ''};`);
    } else if (text === '멈추기') output.push('break;');
    else if (text === '계속하기') output.push('continue;');
    else if (text.endsWith(':')) fail('지원하지 않는 블록 문장입니다.');
    else output.push(text + (text.endsWith(';') ? '' : ';'));
  }
  if (needsIndent) throw new SyntaxError('마지막 블록에 실행할 문장이 필요합니다.');
  while (indents.length > 1) { indents.pop(); output.push('}'); }
  return output.join('\n');
}
