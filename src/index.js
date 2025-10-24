import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { compileSource } from './transformer.js';

const require = createRequire(import.meta.url);
let tsModuleCache;
let defaultCompilerOptions;

function loadTypeScriptModule() {
  if (tsModuleCache) {
    return tsModuleCache;
  }
  let typescript;
  try {
    typescript = require('typescript');
  } catch (initialError) {
    const globalCandidate = path.join(process.execPath, '..', '..', 'lib', 'node_modules', 'typescript');
    try {
      typescript = require(globalCandidate);
    } catch (fallbackError) {
      throw new Error('TypeScript 모듈을 불러올 수 없습니다. Bun 또는 Node 환경에서 TypeScript를 설치해주세요.');
    }
  }
  tsModuleCache = typescript.default ?? typescript;
  return tsModuleCache;
}

function getDefaultCompilerOptions(ts) {
  if (!defaultCompilerOptions) {
    defaultCompilerOptions = {
      allowNonTsExtensions: true,
      noEmit: true,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      target: ts.ScriptTarget.ES2020,
      strict: true,
      esModuleInterop: true
    };
  }
  return defaultCompilerOptions;
}

function createLintHost(ts, compilerOptions, filePath, sourceText) {
  const resolvedFilePath = path.resolve(filePath);
  const baseHost = ts.createCompilerHost(compilerOptions, true);
  const sourceFile = ts.createSourceFile(
    resolvedFilePath,
    sourceText,
    compilerOptions.target ?? ts.ScriptTarget.ES2020,
    true,
    ts.ScriptKind.TS
  );

  const getSourceFile = baseHost.getSourceFile.bind(baseHost);
  const fileExists = baseHost.fileExists.bind(baseHost);
  const readFile = baseHost.readFile.bind(baseHost);

  baseHost.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
    if (path.resolve(fileName) === resolvedFilePath) {
      return shouldCreateNewSourceFile ? ts.createSourceFile(
        resolvedFilePath,
        sourceText,
        languageVersion,
        true,
        ts.ScriptKind.TS
      ) : sourceFile;
    }
    return getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  };

  baseHost.fileExists = (fileName) => {
    if (path.resolve(fileName) === resolvedFilePath) {
      return true;
    }
    return fileExists(fileName);
  };

  baseHost.readFile = (fileName) => {
    if (path.resolve(fileName) === resolvedFilePath) {
      return sourceText;
    }
    return readFile(fileName);
  };

  return baseHost;
}

function formatDiagnostics(ts, diagnostics) {
  if (diagnostics.length === 0) {
    return '';
  }
  const formatHost = {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => '\n'
  };
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost);
}

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

export function lintSource(source, filePath = 'input.ks', compilerOptions) {
  const ts = loadTypeScriptModule();
  const options = compilerOptions ?? getDefaultCompilerOptions(ts);
  const compiled = compileSource(source);
  const host = createLintHost(ts, options, filePath, compiled);
  const program = ts.createProgram([path.resolve(filePath)], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  return {
    diagnostics,
    formattedDiagnostics: formatDiagnostics(ts, diagnostics),
    hasErrors: diagnostics.some((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
  };
}

export async function lintFile(inputPath, compilerOptions) {
  const source = await readFile(inputPath, 'utf8');
  return lintSource(source, inputPath, compilerOptions);
}

export { compileSource };
