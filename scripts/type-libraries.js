import { readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

export async function typeLibraries(root = 'lib.es2022.d.ts') {
  const directory = path.dirname(ts.getDefaultLibFilePath({ target: ts.ScriptTarget.ES2022 }));
  const libraries = {};
  async function visit(name) {
    if (Object.hasOwn(libraries, name)) return;
    const source = await readFile(path.join(directory, name), 'utf8');
    libraries[name] = source;
    for (const match of source.matchAll(/<reference lib="([^"]+)"/g)) await visit(`lib.${match[1]}.d.ts`);
  }
  await visit(root);
  return libraries;
}
