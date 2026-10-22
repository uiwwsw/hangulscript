import * as vscode from 'vscode';
import { Worker } from 'node:worker_threads';
import { formatSource } from '../../../src/formatter.js';
export function activate(context) {
  const selector = { language: 'hangulscript', scheme: 'file' };
  const collection = vscode.languages.createDiagnosticCollection('hangulscript');
  const worker = new Worker(context.asAbsolutePath('out/diagnostic-worker.cjs'), { workerData: { libDirectory: context.asAbsolutePath('out/typescript-libs') } });
  let generation = 0, timer;
  function schedule() {
    clearTimeout(timer);
    const id = ++generation;
    timer = setTimeout(() => {
      const files = vscode.workspace.textDocuments.filter(d => d.languageId === 'hangulscript' && d.uri.scheme === 'file').map(d => [d.uri.fsPath, d.getText()]);
      if (!files.length) { collection.clear(); return; }
      worker.postMessage({ id, files });
    }, 300);
  }
  worker.on('message', ({ id, diagnostics, error }) => {
    if (id !== generation) return;
    collection.clear();
    if (error) { console.error('HangulScript:', error); return; }
    const grouped = new Map();
    for (const item of diagnostics) {
      const uri = vscode.Uri.file(item.filePath);
      const start = new vscode.Position(Math.max(0, item.line - 1), Math.max(0, item.column - 1));
      const diagnostic = new vscode.Diagnostic(new vscode.Range(start, start.translate(0, Math.max(1, item.length))), item.message, item.severity === 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning);
      diagnostic.source = 'HangulScript'; diagnostic.code = item.code;
      if (!grouped.has(uri.toString())) grouped.set(uri.toString(), [uri, []]);
      grouped.get(uri.toString())[1].push(diagnostic);
    }
    for (const [uri, items] of grouped.values()) collection.set(uri, items);
  });
  worker.on('error', error => console.error('HangulScript diagnostics:', error));
  context.subscriptions.push(collection, { dispose() { clearTimeout(timer); worker.terminate(); } },
    vscode.languages.registerDocumentFormattingEditProvider(selector, {
      provideDocumentFormattingEdits(document, options) {
        try {
          const original = document.getText();
          const formatted = formatSource(original, { tabSize: Math.min(8, Math.max(1, options.tabSize)) });
          return original === formatted ? [] : [vscode.TextEdit.replace(new vscode.Range(document.positionAt(0), document.positionAt(original.length)), formatted)];
        } catch (error) { vscode.window.showWarningMessage(`한글스크립트 포맷: ${error.message}`); return []; }
      }
    }),
    vscode.workspace.onDidOpenTextDocument(schedule), vscode.workspace.onDidChangeTextDocument(schedule),
    vscode.workspace.onDidCloseTextDocument(schedule), vscode.workspace.onDidSaveTextDocument(schedule),
    vscode.workspace.onDidChangeWatchedFiles(schedule));
  const watcher = vscode.workspace.createFileSystemWatcher('**/*.hgs');
  context.subscriptions.push(watcher, watcher.onDidChange(schedule), watcher.onDidCreate(schedule), watcher.onDidDelete(schedule));
  schedule();
}
