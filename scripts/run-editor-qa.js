import { runTests } from '@vscode/test-electron';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const dir = await mkdtemp(path.join(os.tmpdir(), 'hgs-editor-test-'));
try {
  await runTests({
    cachePath: path.join(process.env.XDG_CACHE_HOME || os.tmpdir(), "hangulscript-vscode-test"),
    vscodeExecutablePath: process.env.HGS_VSCODE_EXECUTABLE || (process.platform === 'darwin' ? '/Applications/Visual Studio Code.app/Contents/MacOS/Code' : undefined),
    extensionDevelopmentPath: path.resolve('extensions/vscode'),
    extensionTestsPath: path.resolve('extensions/vscode/qa/host.cjs'),
    launchArgs: ['--user-data-dir', path.join(dir, 'profile'), '--extensions-dir', path.join(dir, 'extensions'), '--skip-welcome', '--skip-release-notes', '--disable-updates', '--disable-workspace-trust', '--disable-gpu', '--new-window'],
    extensionTestsEnv: { HGS_TEST_DIRECTORY: dir, HGS_QA_SCREENSHOT_WAIT_MS: process.env.HGS_QA_SCREENSHOT_WAIT_MS }
  });
} finally { await rm(dir, { recursive: true, force: true }); }
