import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRelease } from '../scripts/release-metadata.js';
const root = { name: '@uiwwsw/hangulscript', version: '0.8.0' };
const extension = { publisher: 'uiwwsw', name: 'hangulscript-vscode', version: '0.3.1' };
test('release channels enforce independent identities, exact tags and stable extension versions', () => {
  assert.equal(validateRelease('npm', 'v0.8.0', root, extension).version, '0.8.0');
  assert.equal(validateRelease('vscode', 'vscode-v0.3.1', root, extension).archive, 'extensions/vscode/hangulscript-vscode-0.3.1.vsix');
  for (const tag of ['main', 'v0.3.1', 'vscode-v0.3.2', 'vscode-v0.3.1\ninjected=yes', 'vscode-v0.3.1-beta']) assert.throws(() => validateRelease('vscode', tag, root, extension));
  assert.throws(() => validateRelease('npm', 'vscode-v0.3.1', root, extension));
  assert.throws(() => validateRelease('vscode', 'vscode-v0.3.1', root, { ...extension, publisher: 'other' }));
  assert.throws(() => validateRelease('vscode', 'vscode-v0.3.1', { ...root, name: 'other' }, extension));
});
