import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { inspectSource } from '../src/editor.js';
test('editor API resolves original HGS definitions and scoped inferred types across unsaved modules', () => {
 const root=path.resolve('main.hgs'), math=path.resolve('math.hgs');
 const source='"./math.hgs"에서 { 더함 }을 가져온다\n결과는 더함(1, 2)이다\n출력(결과)';
 const files=new Map([[math,'더함(가: 숫자, 나: 숫자)를 정의한다:\n    돌려주기 가 + 나\n더함을 공개한다']]);
 const result=inspectSource(source,root,2,6,{files});
 assert.match(result.hover,/더함.*number/);
 assert.equal(result.definitions[0].filePath,math);assert.equal(result.definitions[0].line,1);
 assert.ok(result.completions.some(c=>c.name==='더함'));
 const local=inspectSource(source,root,3,5,{files});assert.equal(local.definitions[0].line,2);
});
