import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import { compileSource, buildSource, lintSource } from '../src/index.js';

function run(source) {
  const logs = [];
  const javascript = ts.transpileModule(compileSource(source), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  vm.runInNewContext(javascript, { console: { log: (...values) => logs.push(JSON.stringify(values)) } }, { timeout: 1000 });
  return logs;
}
async function load(source) {
  const { javascript } = buildSource(source);
  return import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
}

test('sentence mode starts directly with code and rejects obsolete start markers', () => {
  assert.deepEqual(run('이름은 "세상"이다\n출력(이름)'), ['["세상"]']);
  for (const marker of ['문장으로 시작', '문장으로 시작.']) assert.throws(() => compileSource(marker + '\n출력(1)'), /시작 표기/);
});

test('keyword and raw JS statement modes are rejected instead of falling back', () => {
  for (const old of ['상수 값 = 1;', '변수 값 = 1;', '함수 인사() { 반환 1; }', '클래스 사람 {}', '내보내기 { 값 }', '콘솔.출력(1)', 'const x = 1;', 'function f() {}', 'export { x };']) {
    assert.throws(() => compileSource(old), /1행/);
  }
});

test('literals, templates, regexes, comments and property names keep their contents', () => {
  const source = '# 상수 함수 참\n객체는 { 참: "거짓" }이다\n참가자는 "상수 함수 참"이다\n출력(객체.참, 참가자, /참/.test("참"), `문자 참: ${참}`)';
  assert.deepEqual(run(source), ['["거짓","상수 함수 참",true,"문자 참: true"]']);
});

test('typed variables, fixed values, Unicode names and nested function signatures work', () => {
  assert.deepEqual(run('값: 숫자는 3이다\n이름은 "한글"으로 고정한다\n더함(가: 숫자, 나 = 2)를 정의한다:\n    안쪽(값: 숫자)를 정의한다:\n        돌려주기 값 + 나\n    돌려주기 안쪽(가)\n출력(더함(값), 이름)'), ['[5,"한글"]']);
  assert.equal(lintSource('자료형 타입은 Map<문자열, 숫자>이다\n계산(값: Map<문자열, 숫자>, 나: 숫자)를 정의한다:\n    돌려주기 나').hasErrors, false);
});

test('while, for, break, continue and do/while execute with correct scopes', () => {
  assert.deepEqual(run('합은 0이다\n각 수를 범위(5)에서:\n    만약 수 == 1 이라면:\n        계속하기\n    만약 수 == 4 이라면:\n        멈추기\n    합 = 합 + 수\n먼저 실행한다:\n    합 = 합 + 1\n합 < 7인 동안 반복한다\n동안 합 < 8:\n    합 = 합 + 1\n출력(합)'), ['[8]']);
  assert.throws(() => compileSource('멈추기'), /반복 블록/);
  assert.throws(() => compileSource('돌려주기 1'), /함수 안/);
  assert.throws(() => compileSource('각 수를 범위(2)에서:\n    출력(수)\n아니면:\n    출력(0)'), /조건 블록/);
});

test('selection branches do not fall through and default works', () => {
  assert.deepEqual(run('값은 2이다\n값에 따라:\n    1인 경우:\n        출력("하나")\n    2인 경우:\n        출력("둘")\n    그 밖의 경우:\n        출력("다른 값")'), ['["둘"]']);
  assert.deepEqual(run('9에 따라:\n    1인 경우:\n        출력(1)\n    그 밖의 경우:\n        출력(9)'), ['[9]']);
});

test('try, catch, throw and finally use sentence blocks', () => {
  assert.deepEqual(run('시도한다:\n    오류를 일으킨다 새 Error("문제")\n오류를 잡으면:\n    출력(String(오류))\n마지막으로:\n    출력("마침")'), ['["Error: 문제"]','["마침"]']);
  assert.throws(() => compileSource('오류를 잡으면:\n    출력(1)'), /시도한다/);
});

test('async await and generators are executable and typed', async () => {
  const module = await load('비동기로 계산(값: 숫자)를 정의한다:\n    결과는 기다리기 Promise.resolve(값 * 2)이다\n    돌려주기 결과\n차례로 목록()를 정의한다:\n    내주기 1\n    내주기 2\n{ 계산, 목록 }을 공개한다');
  assert.equal(await module.계산(7), 14);
  assert.deepEqual([...module.목록()], [1, 2]);
});

test('class construction, inheritance, methods and getter/setter execute', async () => {
  const module = await load('사람 클래스를 정의한다:\n    이름: 문자열은 ""이다\n    생성할 때(이름: 문자열):\n        자신.이름 = 이름\n    소개()를 정의한다:\n        돌려주기 자신.이름\n    별명을 읽으면:\n        돌려주기 자신.이름\n    별명을 바꾸면(값: 문자열):\n        자신.이름 = 값\n사람을 이어받아 학생 클래스를 정의한다:\n    생성할 때(이름: 문자열):\n        부모(이름)\n학생을 공개한다');
  const person = new module.학생('하늘');
  assert.equal(person.소개(), '하늘'); person.별명 = '바다'; assert.equal(person.별명, '바다');
});

test('interfaces, aliases, enums and generics produce JS and precise declarations', async () => {
  const source = '상자<T> 자료형을 정의한다:\n    값: T\n숫자상자 타입은 상자<숫자>이다\n상태 열거값을 정의한다:\n    준비\n    완료\n복사<T>(값: T)를 정의한다:\n    돌려주기 값\n{ 복사, 상태 }를 공개한다';
  const built = buildSource(source);
  assert.match(built.declaration, /복사<T>\(값: T\): T/);
  const module = await load(source); assert.equal(module.복사(3), 3); assert.equal(module.상태.완료, 1);
});

test('ES module named/default imports and exports use sentence forms', async () => {
  const dependency = 'data:text/javascript,export const 값=7;export default 5;';
  const javascript = ts.transpileModule(compileSource(`"${dependency}"에서 { 값 }을 가져온다\n"${dependency}"에서 기본값을 가져온다\n합은 값 + 기본값이다\n합을 기본으로 공개한다`), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  const module = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
  assert.equal(module.default, 12);
});

test('all 15 standard helpers work, including invalid and bounded input cases', () => {
  const result = run('목록은 [3, 1, 2]이다\n추가(목록, 4)\n출력(길이(목록), 포함(목록, 4), 합계(목록), 정렬(목록))\n출력(나누기("가,나", ","), 잇기(["가", "나"], "-"), 숫자로("2"), 다듬기(" 가 "))\n출력(반올림(1.234, 2), 평균(목록), 최솟값(목록), 최댓값(목록), 범위(3, 0, -1))');
  assert.deepEqual(result, ['[4,true,10,[1,2,3,4]]','[["가","나"],"가-나",2,"가"]','[1.23,2.5,1,4,[3,2,1]]']);
  for (const value of ['숫자로("")', '숫자로("NaN")', '평균([])', '최솟값([])', '최댓값([])', '범위(0, 100001)', '반올림(1, 11)']) assert.throws(() => run(`출력(${value})`));
});


test('parameter defaults and names matching type aliases remain correct', async () => {
  const module = await load('확인(숫자: 숫자, 사용 = 참)를 정의한다:\n    돌려주기 사용 ? 숫자 : 0\n확인을 공개한다');
  assert.equal(module.확인(7), 7);
  assert.equal(module.확인(7, false), 0);
});
