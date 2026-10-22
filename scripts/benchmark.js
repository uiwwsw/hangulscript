import { performance } from 'node:perf_hooks';
import { statSync } from 'node:fs';
import { compileSource, buildSource } from '../src/index.js';
const source = '' + Array.from({length:1000}, (_,i)=>`값${i}은 ${i}이다`).join('\n');
const times=[];
for(let i=0;i<20;i++){const start=performance.now();compileSource(source);times.push(performance.now()-start);}
times.sort((a,b)=>a-b);
const start=performance.now();buildSource('출력(합계([1,2,3]))');
console.log(JSON.stringify({node:process.version,lines:1000,iterations:20,medianMs:times[10],p95Ms:times[18],typedBuildMs:performance.now()-start,uiBundleBytes:statSync('site-dist/app.js').size,compilerWorkerBytes:statSync('site-dist/compiler-worker.js').size},null,2));
