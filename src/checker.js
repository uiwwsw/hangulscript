import ts from 'typescript';
import path from 'node:path';
import { compileMappedSource } from './transformer.js';
import { mapDiagnostic, syntaxDiagnostic } from './diagnostics.js';

const libraryCache = new Map();
export function analyzeSource(source, filePath = 'input.hgs', settings = {}) {
  const options = {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, moduleDetection: ts.ModuleDetectionKind.Force,
    strict: true, skipLibCheck: true, declaration: true, noEmitOnError: true, types: [],
    ...settings.compilerOptions
  };
  const originals = new Map([...settings.files ?? []].map(([name, text]) => [path.resolve(name), text]));
  const root = path.resolve(filePath);
  originals.set(root, source);
  const virtual = name => name + '.ts';
  const documents = new Map();
  const syntaxErrors = [];
  const base = ts.createCompilerHost(options, true);
  const libDirectory = settings.libDirectory ?? path.dirname(ts.getDefaultLibFilePath(options));
  function document(name) {
    if (documents.has(virtual(name))) return documents.get(virtual(name));
    const text = originals.get(name) ?? ts.sys.readFile(name);
    if (text === undefined) return null;
    let mapped;
    try { mapped = compileMappedSource(text); }
    catch (error) { syntaxErrors.push(syntaxDiagnostic(error, text, name)); mapped = { code: 'export {};', lineMap: [1] }; }
    const result = { ...mapped, source: text, filePath: name };
    documents.set(virtual(name), result);
    return result;
  }
  const isVirtual = name => name.endsWith('.hgs.ts') || originals.has(name.slice(0, -3));
  const host = {
    ...base,
    getDefaultLibFileName: () => path.join(libDirectory, ts.getDefaultLibFileName(options)),
    getDefaultLibLocation: () => libDirectory,
    fileExists(name) { return isVirtual(name) ? originals.has(name.slice(0, -3)) || ts.sys.fileExists(name.slice(0, -3)) : base.fileExists(name); },
    readFile(name) { return isVirtual(name) ? document(name.slice(0, -3))?.code : base.readFile(name); },
    getSourceFile(name, languageVersion) {
      const text = isVirtual(name) ? document(name.slice(0, -3))?.code : base.readFile(name);
      if (text === undefined) return undefined;
      if (name.startsWith(libDirectory) && name.endsWith('.d.ts')) {
        const cached = libraryCache.get(name);
        if (cached?.text === text) return cached;
        const file = ts.createSourceFile(name, text, languageVersion, true); libraryCache.set(name, file); return file;
      }
      return ts.createSourceFile(name, text, languageVersion, true);
    },
    resolveModuleNames(names, containingFile) {
      return names.map(name => {
        if (name.endsWith('.hgs') && name.startsWith('.')) {
          const original = path.resolve(path.dirname(containingFile), name);
          if (originals.has(original) || ts.sys.fileExists(original)) return { resolvedFileName: virtual(original), extension: ts.Extension.Ts };
        }
        return ts.resolveModuleName(name, containingFile, options, host).resolvedModule;
      });
    }
  };
  const roots = settings.allFiles ? [...originals.keys()] : [root];
  const program = ts.createProgram(roots.map(virtual), options, host);
  const nativeDiagnostics = ts.getPreEmitDiagnostics(program);
  const diagnostics = [...syntaxErrors, ...nativeDiagnostics.map(d => mapDiagnostic(d, documents))];
  return { program, documents, diagnostics, nativeDiagnostics, virtualRoot: virtual(root), compiled: documents.get(virtual(root))?.code ?? '', hasErrors: diagnostics.some(d => d.severity === 'error') };
}

export function checkSource(source, filePath = 'input.hgs', settings = {}) {
  const { diagnostics, hasErrors } = analyzeSource(source, filePath, settings);
  return { diagnostics, hasErrors };
}
