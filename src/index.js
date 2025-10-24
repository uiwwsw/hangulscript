import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileSource } from './transformer.js';

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

export { compileSource };
