import test from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import path from 'node:path';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve('extensions/vscode');
test('packaged extension registers formatting and keeps expressions intact', { skip: !fs.existsSync(`${root}/out/extension.cjs`) }, () => {
  let provider;
  class FakeWorker { on() {} terminate() {} postMessage() {} }
  class Range { constructor(start,end) { this.start=start; this.end=end; } }
  const event = () => ({ dispose() {} });
  const vscode = {
    languages: { createDiagnosticCollection: () => ({clear(){},dispose(){}}), registerHoverProvider:()=>event(),registerDefinitionProvider:()=>event(),registerCompletionItemProvider:()=>event(), registerDocumentFormattingEditProvider: (_, p) => { provider=p; return event(); } },
    workspace: {textDocuments:[],onDidOpenTextDocument:event,onDidChangeTextDocument:event,onDidCloseTextDocument:event,onDidSaveTextDocument:event,onDidChangeWatchedFiles:event,createFileSystemWatcher:()=>({dispose(){},onDidChange:event,onDidCreate:event,onDidDelete:event})},
    TextEdit:{replace:(range,newText)=>({range,newText})}, Range, window:{showWarningMessage(){}}
  };
  const module={exports:{}};
  vm.runInNewContext(fs.readFileSync(`${root}/out/extension.cjs`,'utf8'),{ module,exports:module.exports,require:name=>name==='vscode'?vscode:name==='node:worker_threads'?{Worker:FakeWorker}:require(name),__filename:`${root}/out/extension.cjs`,__dirname:`${root}/out`,console,setTimeout:()=>1,clearTimeout(){} });
  const subscriptions=[];
  module.exports.activate({subscriptions,asAbsolutePath:name=>path.join(root,name)});
  const source='만약 참 이라면:\n  출력("공백  유지")  \n';
  const edits=provider.provideDocumentFormattingEdits({getText:()=>source,positionAt:n=>n},{tabSize:4});
  assert.equal(edits[0].newText,'만약 참 이라면:\n    출력("공백  유지")\n');
  subscriptions.forEach(s=>s.dispose?.());
});
test('bundled diagnostic worker resolves its own standard libraries and reports HGS locations', { skip: !fs.existsSync(`${root}/out/diagnostic-worker.cjs`) }, async () => {
  const worker=new Worker(`${root}/out/diagnostic-worker.cjs`,{workerData:{libDirectory:`${root}/out/typescript-libs`}});
  try {
    const response=new Promise((resolve,reject)=>{worker.once('message',resolve);worker.once('error',reject);});
    worker.postMessage({id:1,files:[[path.resolve('sample.hgs'),'값: 숫자는 "잘못된 값"이다\n']]});
    const result=await response;
    assert.equal(result.error,undefined);
    assert.ok(result.diagnostics.some(d=>d.code===2322 && d.line===1));
    assert.ok(!result.diagnostics.some(d=>d.code===2318));
  } finally { await worker.terminate(); }
});
