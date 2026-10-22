import { build } from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const out = 'extensions/vscode/out';
await mkdir(out, { recursive: true });
for (const name of ['extension', 'diagnostic-worker']) {
  await build({ entryPoints: [`extensions/vscode/src/${name}.js`], outfile: `${out}/${name}.cjs`, bundle: true, platform: 'node', format: 'cjs', external: ['vscode'], target: 'node20', logLevel: 'info' });
}
await cp(path.dirname(require.resolve('typescript')), `${out}/typescript-libs`, { recursive: true, filter: name => !path.extname(name) || name.endsWith('.d.ts') });
await cp('LICENSE', 'extensions/vscode/LICENSE');
