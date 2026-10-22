import ts from 'typescript';
import { compileMappedSource } from '../src/transformer.js';
import { mapDiagnostic, syntaxDiagnostic } from '../src/diagnostics.js';

export function createBrowserChecker(libraries) {
  const libCache = new Map();
  const options = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, strict: true, skipLibCheck: true, noEmit: true, types: [], lib: ['lib.es2022.d.ts'] };
  const globals = 'declare const console: { log(...values: unknown[]): void }; declare function structuredClone<T>(value: T): T;';
  return source => {
    let mapped;
    try { mapped = compileMappedSource(source); }
    catch (error) { return { diagnostics: [syntaxDiagnostic(error, source, 'main.hgs')], hasErrors: true }; }
    const text = new Map(Object.entries(libraries).map(([name, value]) => ['/' + name, value]));
    text.set('/main.ts', mapped.code); text.set('/globals.d.ts', globals);
    const host = {
      getSourceFile(name, version) {
        const source = text.get(name);
        if (source === undefined) return undefined;
        if (name.startsWith('/lib.') && libCache.has(name)) return libCache.get(name);
        const file = ts.createSourceFile(name, source, version, true);
        if (name.startsWith('/lib.')) libCache.set(name, file);
        return file;
      },
      getDefaultLibFileName: () => '/lib.es2022.d.ts', getCurrentDirectory: () => '/',
      getCanonicalFileName: name => name, useCaseSensitiveFileNames: () => true, getNewLine: () => '\n',
      fileExists: name => text.has(name), readFile: name => text.get(name), writeFile() {},
      directoryExists: () => true, getDirectories: () => []
    };
    const program = ts.createProgram(['/main.ts', '/globals.d.ts'], options, host);
    const docs = new Map([['/main.ts', { ...mapped, source, filePath: 'main.hgs' }]]);
    const diagnostics = ts.getPreEmitDiagnostics(program).map(d => mapDiagnostic(d, docs));
    return { compiled: mapped.code, diagnostics, hasErrors: diagnostics.some(d => d.severity === 'error') };
  };
}
