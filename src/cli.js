#!/usr/bin/env node
import { compileFileToDefaultDestination, compileFile, lintFile, buildFile, buildSource } from './index.js';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

function usage() {
  console.log(`사용법:
  ksc [build] [옵션] <파일.hgs ...>  JavaScript와 .d.ts 생성
  ksc run <파일.hgs> [-- 인자 ...]   파일 없이 Node.js로 직접 실행

옵션:
  -o, --out-dir <경로>   출력 디렉터리 (기본: 입력 파일 옆)
  --check                타입 검사만 실행
  --typescript           변환된 TypeScript 확인용 출력
  -h, --help             도움말

문장형은 실험판입니다. run은 신뢰하는 로컬 코드만 실행하세요.`);
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) { usage(); process.exitCode = 1; return; }
  if (args.includes('--help') || args.includes('-h')) { usage(); return; }
  const mode = ['run', 'build'].includes(args[0]) ? args.shift() : 'build';
  let outDir, check = false, typescript = false;
  const inputs = [], programArgs = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--' && mode === 'run') { programArgs.push(...args.slice(index + 1)); break; }
    if (arg === '--out-dir' || arg === '-o') {
      outDir = args[++index];
      if (!outDir || outDir.startsWith('-')) throw new Error('--out-dir에는 경로가 필요합니다.');
    } else if (arg === '--check') check = true;
    else if (arg === '--typescript') typescript = true;
    else if (arg.startsWith('-')) throw new Error(`알 수 없는 옵션: ${arg}`);
    else if (!(/\.hgs$/.test(arg))) throw new Error('입력 파일은 .hgs 확장자여야 합니다.');
    else inputs.push(arg);
  }
  if (!inputs.length) throw new Error('입력 .hgs 파일을 지정하세요.');
  if (check && (outDir || typescript)) throw new Error('--check는 출력 옵션과 함께 사용할 수 없습니다.');
  if (mode === 'run') {
    if (inputs.length !== 1 || outDir || typescript || check) throw new Error('run에는 .hgs 파일 하나와 -- 뒤의 실행 인자만 지정하세요.');
    const input = path.resolve(inputs[0]);
    const { javascript } = buildSource(await readFile(input, 'utf8'), input);
    const child = spawn(process.execPath, ['--input-type=module', '-', ...programArgs], {
      cwd: path.dirname(input), stdio: ['pipe', 'inherit', 'inherit']
    });
    // Preserve imports relative to the source directory. Runtime needs Node.js 20+.
    child.stdin.on('error', () => {});
    child.stdin.end(javascript);
    const exitCode = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
    });
    process.exitCode = exitCode;
    return;
  }
  const destinations = new Set();
  for (const input of inputs) {
    const destination = path.resolve(outDir ?? path.dirname(input), path.parse(input).name);
    if (destinations.has(destination)) throw new Error('출력 파일 이름이 겹칩니다. 파일별로 다른 출력 디렉터리를 사용하세요.');
    destinations.add(destination);
  }
  for (const input of inputs) {
    if (check) {
      const result = await lintFile(input);
      if (result.hasErrors) throw new Error(result.formattedDiagnostics);
      console.log(`✅ ${input} 문제 없음`);
    } else if (typescript) {
      const output = outDir ? path.join(outDir, path.parse(input).name + '.ts') : null;
      const written = output ? (await compileFile(input, output), output) : await compileFileToDefaultDestination(input);
      console.log(`✅ ${written} 생성됨`);
    } else {
      const result = await buildFile(input, outDir);
      console.log(`✅ ${result.javascriptPath}\n✅ ${result.declarationPath}`);
    }
  }
}
main().catch(error => { console.error(`오류: ${error.message}`); process.exitCode = 1; });
