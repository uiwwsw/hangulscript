import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { analyzeSource } from './checker.js';
import { HangulScriptError } from './diagnostics.js';
export async function load(url, context, nextLoad) {
  if (url.startsWith('file:') && new URL(url).pathname.endsWith('.hgs')) {
    const filePath=fileURLToPath(url);
    const source=await readFile(filePath,'utf8');
    const result=analyzeSource(source,filePath);
    if(result.hasErrors) throw new HangulScriptError(result.diagnostics);
    const compiled=ts.transpileModule(result.compiled,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
    return {format:'module',source:compiled,shortCircuit:true};
  }
  return nextLoad(url,context);
}
