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
    const input=path.join(dir,'math.hgs');
    await writeFile(input,'더함(가: 숫자, 나: 숫자)를 정의한다:\n    돌려주기 가 + 나\n더함을 공개한다\n출력(더함(2, 3))');
    let result=spawnSync(process.execPath,[cli,'run',input],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr); assert.equal(result.stdout.trim(),'5');
    await assert.rejects(readFile(path.join(dir,'math.js')),{code:'ENOENT'});
    const old=spawnSync(process.execPath,[cli,'build',path.join(dir,'legacy.ks')],{encoding:'utf8'});
    assert.equal(old.status,1); assert.match(old.stderr,/.hgs 확장자/);
    result=spawnSync(process.execPath,[cli,'build',input],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    assert.match(await readFile(path.join(dir,'math.d.ts'),'utf8'),/더함\(가: number, 나: number\): number/);
    await writeFile(path.join(dir,'package.json'),'{"type":"module"}');
    result=spawnSync(process.execPath,[path.join(dir,'math.js')],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr); assert.equal(result.stdout.trim(),'5');
    result=spawnSync(process.execPath,[cli,'--typescript',input],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr); assert.match(await readFile(path.join(dir,'math.ts'),'utf8'),/가: number/);
    await writeFile(path.join(dir,'library.hgs'), '더함(가: 숫자, 나: 숫자)를 정의한다:\n    돌려주기 가 + 나\n더함을 공개한다');
    result=spawnSync(process.execPath,[cli,'build',path.join(dir,'library.hgs')],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    const moduleInput=path.join(dir,'module.hgs');
    await writeFile(moduleInput, '"./library.js"에서 { 더함 }을 가져온다\n출력(더함(3, 4))');
    result=spawnSync(process.execPath,[cli,'run',moduleInput],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr); assert.equal(result.stdout.trim(),'7');
    result=spawnSync(process.execPath,[cli,'--bad',input],{encoding:'utf8'});
    assert.equal(result.status,1); assert.match(result.stderr,/알 수 없는 옵션/);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
