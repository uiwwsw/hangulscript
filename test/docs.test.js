import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {buildDocs,docPages} from '../scripts/build-docs.js';
import {standardCatalog} from '../scripts/standard-catalog.js';
import {checkSource} from '../src/index.js';
test('documentation has real routes, distinct SEO, complete API signatures and valid internal links',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hgs-docs-'));
 try {
  const routes=await buildDocs('https://hangulscript.vercel.app',dir);
  const titles=new Set();
  for(const route of routes){
   const html=await readFile(path.join(dir,route,'index.html'),'utf8');
   const title=html.match(/<title>(.*?)<\/title>/)[1];assert.ok(!titles.has(title));titles.add(title);
   assert.ok(html.includes(`rel="canonical" href="https://hangulscript.vercel.app${route}"`));
   assert.ok(html.includes('"@type":"TechArticle"'));
   assert.ok(!html.includes('https://github.com/uiwwsw/hangulscript/tree/main/https://'));
   assert.ok(!html.includes('<code>undefined</code>'));
   for(const [,href] of html.matchAll(/href="(\/docs\/[^"#]*)(?:#[^"]*)?"/g))assert.ok(routes.includes(href),href);
  }
  const full=await readFile(path.join(dir,'docs/standard-library/index.html'),'utf8');
  for(const item of standardCatalog)assert.ok(full.includes(`id="${item.name}"`),item.name);
  assert.equal(routes.length,23);assert.equal(docPages.length,23);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('tutorial HGS examples compile with the same checker used by CLI and editor',async()=>{
 for(const name of ['start','collections','writing']){
  const text=await readFile(`docs/guides/${name}.md`,'utf8');
  for(const [,source] of text.matchAll(/```hgs\n([\s\S]*?)```/g)){
   const result=checkSource(source);assert.equal(result.hasErrors,false,name+': '+JSON.stringify(result.diagnostics));
  }
 }
});
