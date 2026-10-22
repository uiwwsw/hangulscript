import * as vscode from 'vscode';
import { Worker } from 'node:worker_threads';
import { formatSource } from '../../../src/formatter.js';
export function activate(context) {
  const selector = { language: 'hangulscript', scheme: 'file' };
  const collection = vscode.languages.createDiagnosticCollection('hangulscript');
  const worker = new Worker(context.asAbsolutePath('out/diagnostic-worker.cjs'), { workerData: { libDirectory: context.asAbsolutePath('out/typescript-libs') } });
  let generation = 0, timer, requestId = 0;
  const pending = new Map();
  const openFiles = () => vscode.workspace.textDocuments.filter(d => d.languageId === 'hangulscript' && d.uri.scheme === 'file').map(d => [d.uri.fsPath, d.getText()]);
  function inspect(document, position, token) {
    if (token?.isCancellationRequested) return Promise.resolve(null);
    const version = document.version;
    const id = `inspect:${++requestId}`;
    return new Promise(resolve => {
      const timeout = setTimeout(() => { pending.delete(id); resolve(null); }, 15000);
      pending.set(id, result => { clearTimeout(timeout); resolve(token?.isCancellationRequested || document.version !== version ? null : result); });
      worker.postMessage({ id, method: 'inspect', files: openFiles(), filePath: document.uri.fsPath, line: position.line + 1, column: position.character + 1 });
    });
  }
  function schedule() {
    clearTimeout(timer);
    const id = ++generation;
    timer = setTimeout(() => {
      const files = openFiles();
      if (!files.length) { collection.clear(); return; }
      worker.postMessage({ id, files });
    }, 300);
  }
  worker.on('message', ({ id, diagnostics, error, method, result }) => {
    if (method === 'inspect') { if(error) console.error('HangulScript inspect:',error); pending.get(id)?.(result); pending.delete(id); return; }
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
  context.subscriptions.push(collection, { dispose() { clearTimeout(timer); for (const resolve of pending.values()) resolve(null); pending.clear(); worker.terminate(); } },
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
    vscode.languages.registerHoverProvider(selector, {
      async provideHover(document, position, token) {
        const result = await inspect(document, position, token);
        return result?.hover ? new vscode.Hover(new vscode.MarkdownString().appendCodeblock(result.hover, 'typescript')) : null;
      }
    }),
    vscode.languages.registerDefinitionProvider(selector, {
      async provideDefinition(document, position, token) {
        const result = await inspect(document, position, token);
        return result?.definitions.map(d => new vscode.Location(vscode.Uri.file(d.filePath), new vscode.Range(d.line - 1, d.column - 1, d.line - 1, d.column - 1 + d.length))) ?? [];
      }
    }),
    vscode.languages.registerCompletionItemProvider(selector, {
      async provideCompletionItems(document, position, token) {
        const result = await inspect(document, position, token);
        return result?.completions.map(item => { const entry = new vscode.CompletionItem(item.name, vscode.CompletionItemKind.Variable); entry.detail = item.detail; return entry; }) ?? [];
      }
    }));
  const watcher = vscode.workspace.createFileSystemWatcher('**/*.hgs');
  context.subscriptions.push(watcher, watcher.onDidChange(schedule), watcher.onDidCreate(schedule), watcher.onDidDelete(schedule));
  schedule();
}
