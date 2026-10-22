import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileSource } from './transformer.js';
import { analyzeSource } from './checker.js';
import { formatSourceDiagnostics } from './diagnostics.js';
import { emitSource } from './emitter.js';
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
  const { javascript, declaration } = emitSource(source, filePath);
  return { javascript, declaration };
}

export async function buildFile(inputPath, outputDirectory = path.dirname(inputPath)) {
  const source = await readFile(inputPath, 'utf8');
  const { javascript, declaration, modules } = emitSource(source, inputPath);
  const rootDirectory = path.dirname(path.resolve(inputPath));
  const destinations = modules.map(module => {
    const relative = path.relative(rootDirectory, module.sourcePath);
    if (relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
      throw new Error('빌드 입력 파일의 폴더 밖에 있는 .hgs 모듈은 지원하지 않습니다. 공통 상위 폴더에 진입 파일을 두세요.');
    }
    const base = path.join(outputDirectory, relative.replace(/\.hgs$/, ''));
    return { ...module, javascriptPath: base + '.js', declarationPath: base + '.d.ts' };
  });
  // Validate the complete graph before writing any output.
  for (const module of destinations) {
    await mkdir(path.dirname(module.javascriptPath), { recursive: true });
    await writeFile(module.javascriptPath, module.javascript, 'utf8');
    await writeFile(module.declarationPath, module.declaration, 'utf8');
  }
  const root = destinations.find(module => module.sourcePath === path.resolve(inputPath));
  return { javascript, declaration, javascriptPath: root.javascriptPath, declarationPath: root.declarationPath };
}

export { formatSource } from './formatter.js';
