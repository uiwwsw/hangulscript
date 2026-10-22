import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileSource } from './transformer.js';
import { analyzeSource } from './checker.js';
import { HangulScriptError, formatSourceDiagnostics, mapDiagnostic } from './diagnostics.js';
export { checkSource } from './checker.js';
export { HangulScriptError, formatSourceDiagnostics } from './diagnostics.js';

export function compileString(source) {
  return compileSource(source);
}

export async function compileFile(inputPath, outputPath) {
  const source = await readFile(inputPath, 'utf8');
  const compiled = compileSource(source);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, compiled, 'utf8');
  return compiled;
}

export async function compileFileToDefaultDestination(inputPath) {
  const parsed = path.parse(inputPath);
  const outputPath = path.join(parsed.dir, `${parsed.name}.ts`);
  await compileFile(inputPath, outputPath);
  return outputPath;
}

export function lintSource(source, filePath = 'input.hgs', compilerOptions) {
  compileSource(source); // Keep syntax errors explicit for callers of the legacy lint API.
  const result = analyzeSource(source, filePath, { compilerOptions });
  return {
    diagnostics: result.nativeDiagnostics,
    sourceDiagnostics: result.diagnostics,
    formattedDiagnostics: formatSourceDiagnostics(result.diagnostics),
    hasErrors: result.hasErrors
  };
}

export async function lintFile(inputPath, compilerOptions) {
  const source = await readFile(inputPath, 'utf8');
  return lintSource(source, inputPath, compilerOptions);
}

export { compileSource };

/** Compile through TypeScript once, emitting executable JS and declarations in memory. */
export function buildSource(source, filePath = 'input.hgs') {
  const result = analyzeSource(source, filePath);
  if (result.hasErrors) throw new HangulScriptError(result.diagnostics);
  const files = new Map();
  const emitted = result.program.emit(undefined, (name, content) => files.set(name, content));
  if (emitted.emitSkipped) throw new HangulScriptError(emitted.diagnostics.map(d => mapDiagnostic(d, result.documents)));
  return {
    javascript: files.get(result.virtualRoot.replace(/\.ts$/, '.js')) ?? '',
    declaration: files.get(result.virtualRoot.replace(/\.ts$/, '.d.ts')) ?? ''
  };
}

export async function buildFile(inputPath, outputDirectory = path.dirname(inputPath)) {
  const source = await readFile(inputPath, 'utf8');
  const result = buildSource(source, inputPath);
  const base = path.parse(inputPath).name;
  await mkdir(outputDirectory, { recursive: true });
  const javascriptPath = path.join(outputDirectory, base + '.js');
  const declarationPath = path.join(outputDirectory, base + '.d.ts');
  await writeFile(javascriptPath, result.javascript, 'utf8');
  await writeFile(declarationPath, result.declaration, 'utf8');
  return { ...result, javascriptPath, declarationPath };
}

export { formatSource } from './formatter.js';
