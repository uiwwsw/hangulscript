import ts from 'typescript';
import { compileSource } from './transformer.js';

/** Build-time .hgs imports for Vite projects, including React and Vue. */
export default function hangulscript() {
  return {
    name: 'hangulscript',
    enforce: 'pre',
    transform(source, id) {
      if (!/\.hgs$/.test(id.split('?')[0]) || /[?&](?:raw|url)(?:[=&]|$)/.test(id)) return null;
      const compiled = compileSource(source);
      const result = ts.transpileModule(compiled, {
        fileName: id.replace(/\.hgs(?:\?.*)?$/, '.ts'),
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, sourceMap: false },
        reportDiagnostics: true
      });
      const errors = (result.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error);
      if (errors.length) throw new Error(errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
      return { code: result.outputText, map: null };
    }
  };
}
