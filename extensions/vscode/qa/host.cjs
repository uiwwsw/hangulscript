const vscode = require('vscode');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(predicate) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) { const value = await predicate(); if (value) return value; await pause(100); }
  throw Error('VS Code integration test timed out');
}
exports.run = async () => {
  const root=process.env.HGS_TEST_DIRECTORY;
  const file=path.join(root,'sample.hgs');
  await fs.writeFile(file,'만약 참 이라면:\n  출력("안녕")  \n');
  const document=await vscode.workspace.openTextDocument(file);
  await vscode.window.showTextDocument(document);
  assert.equal(document.languageId,'hangulscript');
  const extension=vscode.extensions.getExtension('uiwwsw.hangulscript-vscode');
  assert.ok(extension); await extension.activate();
  const edits=await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', document.uri, {tabSize:4, insertSpaces:true});
  const formatting = new vscode.WorkspaceEdit(); formatting.set(document.uri, edits); await vscode.workspace.applyEdit(formatting);
  assert.equal(document.getText(),'만약 참 이라면:\n    출력("안녕")\n');
  const replace = async text => {
    const edit=new vscode.WorkspaceEdit(); edit.replace(document.uri,new vscode.Range(document.positionAt(0),document.positionAt(document.getText().length)),text); await vscode.workspace.applyEdit(edit);
  };
  await replace('값: 숫자는 "오류"이다\n');
  const diagnostics=await waitFor(()=>vscode.languages.getDiagnostics(document.uri).find(d=>d.code===2322));
  assert.equal(diagnostics.range.start.line,0); assert.equal(diagnostics.source,'HangulScript');
  await replace('값: 숫자는 42이다\n');
  await waitFor(()=>vscode.languages.getDiagnostics(document.uri).length===0);
  await fs.writeFile(path.join(root,'math.hgs'),'더함(가: 숫자, 나: 숫자)를 정의한다:\n    돌려주기 가 + 나\n더함을 공개한다');
  await replace('"./math.hgs"에서 { 더함 }을 가져온다\n결과는 더함(2, 3)이다\n출력(결과)\n');
  const hover=await vscode.commands.executeCommand('vscode.executeHoverProvider',document.uri,new vscode.Position(1,4));
  assert.ok(hover.some(h=>h.contents.some(c=>(typeof c==='string'?c:c.value ?? '').includes('number'))));
  const definitions=await vscode.commands.executeCommand('vscode.executeDefinitionProvider',document.uri,new vscode.Position(1,4));
  assert.ok(definitions.some(d=>d.uri.fsPath.endsWith('math.hgs') && d.range.start.line===0));
  const completion=await vscode.commands.executeCommand('vscode.executeCompletionItemProvider',document.uri,new vscode.Position(2,5));
  assert.ok(completion.items.some(item=>item.label==='더함'));
  console.log('PASS: hover, cross-file definition and scoped completion');
  console.log('PASS: real VS Code activation, .hgs association, formatting, unsaved type error and correction');
};
