import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildFile } from '../src/index.js';
const cli=path.resolve('src/cli.js');
test('multi-file build emits JS/declarations with executable module paths, run loads HGS without artifacts', async () => {
 const dir=await mkdtemp(path.join(os.tmpdir(),'hgs-modules-'));
 try {
  await mkdir(path.join(dir,'lib'));
  await writeFile(path.join(dir,'package.json'),'{"type":"module"}');
  await writeFile(path.join(dir,'lib/math.hgs'),'더함(가: 숫자, 나: 숫자)를 정의한다:\n    돌려주기 가 + 나\n더함을 공개한다');
  const input=path.join(dir,'main.hgs');
  await writeFile(input,'"./lib/math.hgs"에서 { 더함 }을 가져온다\n결과는 더함(2, 3)이다\n결과를 공개한다\n출력(결과)');
  const run=spawnSync(process.execPath,[cli,'run',input],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);assert.equal(run.stdout.trim(),'5');
  await assert.rejects(readFile(path.join(dir,'main.js')),{code:'ENOENT'});
  const output=await buildFile(input,path.join(dir,'out'));
  assert.match(output.javascript,/\.\/lib\/math\.js/);
  assert.match(await readFile(path.join(dir,'out/lib/math.d.ts'),'utf8'),/number/);
  assert.equal((await import(pathToFileURL(output.javascriptPath))).결과,5);
  await writeFile(path.join(dir,'lib/math.hgs'),'값: 숫자는 "오류"이다');
  await assert.rejects(buildFile(input,path.join(dir,'bad')),/TS2322/);
  await assert.rejects(readFile(path.join(dir,'bad/main.js')),{code:'ENOENT'});
 } finally {await rm(dir,{recursive:true,force:true});}
});
