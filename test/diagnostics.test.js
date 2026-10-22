import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { checkSource, buildSource } from '../src/index.js';
import { compileMappedSource } from '../src/transformer.js';
import { createBrowserChecker } from '../site/browser-checker.js';
import { typeLibraries } from '../scripts/type-libraries.js';
import hangulscript from '../src/vite.js';

test('semantic diagnostics reference original HGS lines and columns, not runtime helpers', () => {
  const result = checkSource('# 설명\n값: 숫자는 "문자"이다\n출력(없는이름)', 'example.hgs');
  assert.equal(result.hasErrors, true);
  const assignment = result.diagnostics.find(d => d.code === 2322);
  assert.equal(assignment.line, 2); assert.equal(assignment.column, 1);
  const missing = result.diagnostics.find(d => d.code === 2304);
  assert.equal(missing.line, 3); assert.equal(missing.column, 4);
  assert.match(missing.filePath, /example.hgs$/);
  assert.throws(() => buildSource('값: 숫자는 "문자"이다', 'wrong.hgs'), /wrong.hgs:1:1.*TS2322/);
});

test('syntax, wrong argument type/count and missing property are checked', () => {
  const syntax = checkSource('만약 참 이라면:\n출력(1)');
  assert.equal(syntax.diagnostics[0].code, 'HGS1001'); assert.equal(syntax.diagnostics[0].line, 2);
  for (const [source, code] of [
    ['더함(가: 숫자, 나: 숫자)를 정의한다:\n    돌려주기 가 + 나\n더함("문자", 1)', 2345],
    ['더함(가: 숫자, 나: 숫자)를 정의한다:\n    돌려주기 가 + 나\n더함(1)', 2554],
    ['값은 { 이름: "하늘" }이다\n출력(값.나이)', 2339]
  ]) assert.ok(checkSource(source).diagnostics.some(d => d.code === code));
});

test('mapping covers every generated line and preserves nested original positions', () => {
  const source = '인사(이름: 문자열)를 정의한다:\n    만약 참 이라면:\n        출력(없는이름)';
  const mapped = compileMappedSource(source);
  assert.equal(mapped.lineMap.length, mapped.code.split('\n').length);
  const diagnostic = checkSource(source).diagnostics.find(d => d.code === 2304);
  assert.equal(diagnostic.line, 3); assert.equal(diagnostic.column, 12);
});

test('Vite rejects transitive type errors and checks consumers after dependency changes', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'hgs-check-'));
  try {
    const dependency = path.join(directory, 'dependency.hgs');
    const main = path.join(directory, 'main.hgs');
    const good = '값은 1이다\n값을 공개한다';
    await writeFile(dependency, good);
    const source = '"./dependency.hgs"에서 { 값 }을 가져온다\n결과: 숫자는 값이다';
    const plugin = hangulscript();
    assert.match(plugin.transform(source, main).code, /dependency.hgs/);
    const bad = '값은 "문자"이다\n값을 공개한다';
    await writeFile(dependency, bad);
    assert.throws(() => plugin.transform(bad, dependency), /main.hgs:2:1.*TS2322/);
    await writeFile(dependency, '값: 숫자는 "문자"이다\n값을 공개한다');
    const fresh = hangulscript();
    assert.throws(() => fresh.transform(source, main), /dependency.hgs:1:1.*TS2322/);
    assert.throws(() => fresh.transform('없는함수()', main), /TS2304/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('browser semantic checker catches the same errors without Node imports or execution', async () => {
  const check = createBrowserChecker(await typeLibraries());
  assert.equal(check('출력(평균([10, 20]))').hasErrors, false);
  const result = check('가격: 숫자는 "문자"이다');
  assert.equal(result.hasErrors, true);
  assert.ok(result.diagnostics.some(d => d.code === 2322 && d.line === 1));
  assert.ok(check('출력(없는이름)').diagnostics.some(d => d.code === 2304));
});

test('project tsconfig extends and strict options are respected without suppressing HGS emission', async () => {
 const dir=await mkdtemp(path.join(tmpdir(),'hgs-config-'));
 try {
  await writeFile(path.join(dir,'base.json'),JSON.stringify({compilerOptions:{strict:true,noUnusedLocals:true,noEmit:true}}));
  await writeFile(path.join(dir,'tsconfig.json'),JSON.stringify({extends:'./base.json',compilerOptions:{target:'ES2022'}}));
  const source='안쓰는값은 1이다';
  const result=checkSource(source,path.join(dir,'main.hgs'));
  assert.ok(result.diagnostics.some(d=>d.code===6133 && d.line===1));
  await writeFile(path.join(dir,'tsconfig.json'),JSON.stringify({compilerOptions:{noEmit:true}}));
  assert.match(buildSource('출력(1)',path.join(dir,'main.hgs')).javascript,/console/);
 } finally {await rm(dir,{recursive:true,force:true});}
});
