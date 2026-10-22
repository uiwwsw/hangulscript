import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const cli=path.resolve('src/cli.js');
test('CLI builds executable ESM and declarations, runs without files, keeps TS option', async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ks-cli-'));
  try {
    const input=path.join(dir,'math.ks');
    await writeFile(input,'문장으로 시작\n더함(가: 숫자, 나: 숫자)를 정의한다:\n    돌려주기 가 + 나\n내보내기 { 더함 }\n출력(더함(2, 3))');
    let result=spawnSync(process.execPath,[cli,'run',input],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr); assert.equal(result.stdout.trim(),'5');
    await assert.rejects(readFile(path.join(dir,'math.js')),{code:'ENOENT'});
    result=spawnSync(process.execPath,[cli,'build',input],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    assert.match(await readFile(path.join(dir,'math.d.ts'),'utf8'),/더함\(가: number, 나: number\): number/);
    await writeFile(path.join(dir,'package.json'),'{"type":"module"}');
    result=spawnSync(process.execPath,[path.join(dir,'math.js')],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr); assert.equal(result.stdout.trim(),'5');
    result=spawnSync(process.execPath,[cli,'--typescript',input],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr); assert.match(await readFile(path.join(dir,'math.ts'),'utf8'),/가: number/);
    result=spawnSync(process.execPath,[cli,'--bad',input],{encoding:'utf8'});
    assert.equal(result.status,1); assert.match(result.stderr,/알 수 없는 옵션/);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
