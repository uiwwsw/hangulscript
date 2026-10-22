import ts from 'typescript';
import libraries from '/type-libs.js';
import { createBrowserChecker } from './browser-checker.js';
import { HangulScriptError } from '../src/diagnostics.js';
const check = createBrowserChecker(libraries);
import { emittedCode } from './emitted-code.js';
let cachedSource;
let cachedResult;
self.onmessage = ({ data: { id, source } }) => {
  try {
    if (source.length > 30000) throw new Error('코드는 30000자까지 입력할 수 있습니다.');
    if (source !== cachedSource) {
      const start = performance.now();
      const checked = check(source);
      if (checked.hasErrors) throw new HangulScriptError(checked.diagnostics);
      const compiled = checked.compiled;
      const result = ts.transpileModule(compiled, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None }, reportDiagnostics: true });
      const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
      if (errors.length) throw new Error(errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
      cachedResult = { ...emittedCode(compiled), duration: performance.now() - start };
      cachedSource = source;
    }
    self.postMessage({ id, ...cachedResult });
  } catch (error) { self.postMessage({ id, error: error.message, diagnostics: error.diagnostics ?? [] }); }
};
