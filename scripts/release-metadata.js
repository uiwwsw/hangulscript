import { readFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function validateRelease(kind, tag, root, extension) {
  if (root.name !== '@uiwwsw/hangulscript') throw new Error('Unexpected npm package identity');
  if (kind === 'npm') {
    if (tag !== `v${root.version}` || !/^v\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(tag)) throw new Error('npm tag/version mismatch');
    return { version: root.version };
  }
  if (kind !== 'vscode' || extension.publisher !== 'uiwwsw' || extension.name !== 'hangulscript-vscode') throw new Error('Unexpected extension identity');
  if (tag !== `vscode-v${extension.version}` || !/^vscode-v\d+\.\d+\.\d+$/.test(tag)) throw new Error('VS Code tag/version mismatch');
  return { version: extension.version, archive: `extensions/vscode/hangulscript-vscode-${extension.version}.vsix` };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = validateRelease(process.argv[2], process.argv[3], JSON.parse(readFileSync('package.json')), JSON.parse(readFileSync('extensions/vscode/package.json')));
  for (const [name, value] of Object.entries(result)) {
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
    console.log(`${name}: ${value}`);
  }
}
