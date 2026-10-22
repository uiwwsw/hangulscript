import ts from 'typescript';
import { analyzeSource } from './checker.js';
import { HangulScriptError } from './diagnostics.js';

/** Semantic checking is mandatory in both Vite development and production builds. */
export default function hangulscript() {
  const files = new Map();
  return {
    name: 'hangulscript',
    enforce: 'pre',
    buildStart() { files.clear(); },
    watchChange(id, change) { if (change.event === 'delete') files.delete(id.split('?')[0]); },
    transform(source, id) {
      const filePath = id.split('?')[0];
      if (!/\.hgs$/.test(filePath) || /[?&](?:raw|url)(?:[=&]|$)/.test(id)) return null;
      files.set(filePath, source);
      const checked = analyzeSource(source, filePath, { files, allFiles: true });
      if (typeof this?.addWatchFile === 'function') for (const doc of checked.documents.values()) this.addWatchFile(doc.filePath);
      if (checked.hasErrors) {
        const error = new HangulScriptError(checked.diagnostics);
        const first = checked.diagnostics.find(d => d.severity === 'error');
        if (typeof this?.error === 'function') return this.error({ message: error.message, id: first.filePath, loc: { file: first.filePath, line: first.line, column: first.column - 1 } });
        throw error;
      }
      const result = ts.transpileModule(checked.compiled, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
      return { code: result.outputText, map: null };
    }
  };
}
