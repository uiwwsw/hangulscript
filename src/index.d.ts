import type * as ts from 'typescript';
export { compileSource } from './transformer.js';
export function compileString(source: string): string;
export function compileFile(inputPath: string, outputPath: string): Promise<string>;
export function compileFileToDefaultDestination(inputPath: string): Promise<string>;
export interface LintResult {
  diagnostics: readonly ts.Diagnostic[];
  formattedDiagnostics: string;
  hasErrors: boolean;
}
export function lintSource(source: string, filePath?: string, compilerOptions?: ts.CompilerOptions): LintResult;
export function lintFile(inputPath: string, compilerOptions?: ts.CompilerOptions): Promise<LintResult>;
export interface BuildResult { javascript: string; declaration: string; }
export function buildSource(source: string, filePath?: string): BuildResult;
export function buildFile(inputPath: string, outputDirectory?: string): Promise<BuildResult & { javascriptPath: string; declarationPath: string }>;
