import type * as ts from 'typescript';
export { compileSource } from './transformer.js';
export function compileString(source: string): string;
export function compileFile(inputPath: string, outputPath: string): Promise<string>;
export function compileFileToDefaultDestination(inputPath: string): Promise<string>;
export interface LintResult {
  diagnostics: readonly ts.Diagnostic[];
  sourceDiagnostics: readonly SourceDiagnostic[];
  formattedDiagnostics: string;
  hasErrors: boolean;
}
export function lintSource(source: string, filePath?: string, compilerOptions?: ts.CompilerOptions): LintResult;
export function lintFile(inputPath: string, compilerOptions?: ts.CompilerOptions): Promise<LintResult>;
export interface BuildResult { javascript: string; declaration: string; }
export function buildSource(source: string, filePath?: string): BuildResult;
export function buildFile(inputPath: string, outputDirectory?: string): Promise<BuildResult & { javascriptPath: string; declarationPath: string }>;

export interface SourceDiagnostic { filePath: string; line: number; column: number; length: number; code: number | string; message: string; severity: 'error' | 'warning'; }
export interface CheckSettings { files?: ReadonlyMap<string, string>; allFiles?: boolean; libDirectory?: string; compilerOptions?: ts.CompilerOptions; }
export function checkSource(source: string, filePath?: string, settings?: CheckSettings): { diagnostics: SourceDiagnostic[]; hasErrors: boolean };
export function formatSourceDiagnostics(diagnostics: readonly SourceDiagnostic[]): string;
export class HangulScriptError extends Error { diagnostics: SourceDiagnostic[]; constructor(diagnostics: SourceDiagnostic[]); }

export { formatSource } from './formatter.js';
