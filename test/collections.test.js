import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildSource, checkSource } from '../src/index.js';
import { sentenceRuntime } from '../src/runtime.js';
import { standardCatalog } from '../scripts/standard-catalog.js';
import ts from 'typescript';
const js=ts.transpileModule(sentenceRuntime,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
function evaluate(source) {return vm.runInNewContext(js+'\n'+source,{structuredClone,Map,Set,console:{log(){}}},{timeout:1000});}
test('all public helpers have executable documented examples and typed signatures',()=>{
 const file=ts.createSourceFile('runtime.ts',sentenceRuntime,ts.ScriptTarget.Latest,true);
 const names=[...new Set(file.statements.filter(ts.isFunctionDeclaration).map(n=>n.name.text))].filter(n=>!['화면연결','정렬비교'].includes(n));
 assert.deepEqual([...standardCatalog.map(r=>r.name)].sort(),names.sort());
 for (const item of standardCatalog) {
  const result=checkSource(item.example,item.name+'.hgs');
  assert.equal(result.hasErrors,false,item.name+': '+JSON.stringify(result.diagnostics));
  if(item.category!=='화면') {
   const code=buildSource(item.example).javascript.replace(/export \{\};\s*$/,'');
   vm.runInNewContext(code,{console:{log(){}},structuredClone,Map,Set},{timeout:1000});
  }
 }
});
test('collection operations preserve values, order and mutation contracts',()=>{
 assert.equal(evaluate('JSON.stringify([각각바꾸기([1,2], x=>x*2), 골라내기([1,2,3],x=>x>1), 누적하기([1,2,3],0,(a,b)=>a+b), 펼치기([[1],[2,3]]), 나눠묶기([1,2,3],2), 짝짓기([1,2],["가"])])'),'[[2,4],[2,3],6,[1,2,3],[[1,2],[3]],[[1,"가"]]]');
 assert.equal(evaluate('JSON.stringify([찾기([],()=>true), 순서찾기([],()=>true), 모두만족([],()=>false), 하나라도만족([],()=>true)])'),'[null,-1,true,false]');
 assert.equal(evaluate('const a=[3,1,2]; const b=내림차순(a); JSON.stringify([a,b,오름차순(["10","2","1"])])'),'[[3,1,2],[3,2,1],["1","2","10"]]');
 assert.equal(evaluate('const a=집합([1,2]), b=집합([2,3]); JSON.stringify([목록으로(합집합(a,b)),목록으로(교집합(a,b)),목록으로(차집합(a,b)),목록으로(대칭차집합(a,b)),부분집합인가(집합(),a),길이(a),포함(a,2)])'),'[[1,2,3],[2],[1],[1,3],true,2,true]');
 assert.equal(evaluate('const a=사전([["a",1]]);사전에담기(a,"b",2);사전에서삭제(a,"a");JSON.stringify([키목록(a),값목록(a),항목목록(a),길이(a),사전에서읽기(a,"a"),사전에있는가(a,"b")])'),'[["b"],[2],[["b",2]],1,null,true]');
});
test('shallow/deep copies, stable keyed sorting and error conditions are explicit',()=>{
 assert.equal(evaluate('const a=[{x:1}];const b=얕게복사(a), c=깊게복사(a);b[0].x=2;JSON.stringify([a!==b,a[0]===b[0],a[0]===c[0],c[0].x])'),'[true,true,false,1]');
 assert.equal(evaluate('const a={};a.self=a;const b=깊게복사(a);b!==a&&b.self===b'),true);
 assert.equal(evaluate('let calls=0;const a=[{n:1,id:"a"},{n:2,id:"b"},{n:1,id:"c"}];JSON.stringify([기준정렬(a,x=>{calls++;return x.n},"내림차순").map(x=>x.id),calls])'),'[["b","a","c"],3]');
 for(const source of ['나눠묶기([1],0)','정렬([NaN])','정렬([1,"a"])','기준정렬([1],x=>x,"오타")','깊게복사(()=>1)','얕게복사(new Date())','확인한다(false,"조건 오류")']) assert.throws(()=>evaluate(source),undefined,source);
 for(const source of ['출력(골라내기([1, 2], 값 => 값))','출력(누적하기([1], 0, (합, 값) => "문자"))','출력(사전에서읽기(사전([["키", 1]]), 42))','출력(오름차순([{}]))']) assert.equal(checkSource(source).hasErrors,true,source);
});

test('collection sentence expressions compile deterministically and preserve quoted prose',()=>{
 const source='값들은 [3, 1, 3]이다\n정돈한값은 값들을 오름차순으로 정렬한 값이다\n고유값은 값들에서 중복을 제거한 값이다\n독립본은 값들을 깊게 복사한 값이다\n출력(정돈한값, 고유값, 독립본, "값들을 깊게 복사한 값")';
 const code=buildSource(source).javascript.replace(/export \{\};\s*$/,'');
 const logs=[];vm.runInNewContext(code,{structuredClone,console:{log:(...values)=>logs.push(JSON.stringify(values))}});
 assert.equal(logs[0],'[[1,3,3],[3,1],[3,1,3],"값들을 깊게 복사한 값"]');
});
