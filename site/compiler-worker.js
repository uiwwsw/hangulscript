import ts from 'typescript';
import { compileSource } from '../src/transformer.js';
import { sentenceRuntime } from '../src/sentences.js';
let cachedSource;
let cachedResult;
self.onmessage = ({ data: { id, source } }) => {
  try {
    if (source.length > 30000) throw new Error('코드는 30000자까지 입력할 수 있습니다.');
    if (source !== cachedSource) {
      const start = performance.now();
      const compiled = compileSource(source);
      const result = ts.transpileModule(compiled, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None }, reportDiagnostics: true });
      const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
      if (errors.length) throw new Error(errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
      const display = ts.createPrinter().printFile(ts.createSourceFile('main.ts', compiled.replace(sentenceRuntime, '// 한글 기본 함수는 실행 시 포함됩니다.\n'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
      const displayJavascript = ts.transpileModule(display, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
      cachedResult = { javascript: result.outputText, display, displayJavascript, duration: performance.now() - start };
      cachedSource = source;
    }
    self.postMessage({ id, ...cachedResult });
  } catch (error) { self.postMessage({ id, error: error.message }); }
};
