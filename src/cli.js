#!/usr/bin/env node
import { compileFileToDefaultDestination, compileFile, lintFile } from './index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

function printUsage() {
  console.log(`사용법: ksc [옵션] <입력.ks ...>

옵션:
  -o, --out-dir <경로>   변환된 .ts 파일을 저장할 디렉터리
  --check                .ks 파일을 타입 검사만 합니다 (파일 생성 없음)
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  let outDir;
  let checkOnly = false;
  const inputFiles = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '-o' || arg === '--out-dir') {
      const next = args[i + 1];
      if (!next) {
        console.error('오류: --out-dir 옵션에는 경로가 필요합니다.');
        process.exitCode = 1;
        return;
      }
      outDir = next;
      i += 1;
      continue;
    }
    if (arg === '--check') {
      checkOnly = true;
      continue;
    }
    if (arg === '-h' || arg === '--help') {
      printUsage();
      return;
    }
    inputFiles.push(arg);
  }

  if (inputFiles.length === 0) {
    console.error('오류: 변환할 .ks 파일을 지정해주세요.');
    process.exitCode = 1;
    return;
  }

  if (checkOnly && outDir) {
    console.error('오류: --check 옵션과 --out-dir 옵션은 동시에 사용할 수 없습니다.');
    process.exitCode = 1;
    return;
  }

  if (checkOnly) {
    let hasFailures = false;
    for (const input of inputFiles) {
      try {
        const result = await lintFile(input);
        if (result.diagnostics.length > 0) {
          hasFailures = true;
          if (result.formattedDiagnostics) {
            console.error(result.formattedDiagnostics.trimEnd());
          }
        } else {
          console.log(`✅ ${input} 문제 없음`);
        }
      } catch (error) {
        console.error(`오류: ${input} 검사에 실패했습니다.`);
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
        return;
      }
    }
    if (hasFailures) {
      process.exitCode = 1;
    }
    return;
  }

  const results = [];
  for (const input of inputFiles) {
    const outputPath = outDir
      ? path.join(outDir, `${path.parse(input).name}.ts`)
      : undefined;
    try {
      if (outputPath) {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await compileFile(input, outputPath);
        results.push(outputPath);
      } else {
        const generatedPath = await compileFileToDefaultDestination(input);
        results.push(generatedPath);
      }
    } catch (error) {
      console.error(`오류: ${input} 변환에 실패했습니다.`);
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
      return;
    }
  }

  for (const file of results) {
    console.log(`✅ ${file} 생성됨`);
  }
}

main();
