import test from 'node:test';
import assert from 'node:assert/strict';
import { compileString } from '../src/index.js';

const fixture = `상수 이름 = "철수";
변수 나이 = 12;

함수 인사(사람이름: 문자열): 문자열 {
  만약 (나이 >= 20) {
    반환 \`안녕 \${사람이름}!\`;
  } 아니면 {
    반환 \`안녕 아직 \${나이}살!\`;
  }
}

클래스 사람 {
  생성자(이름: 문자열) {
    이것.이름 = 이름;
  }

  함수 소개(): 문자열 {
    반환 \`\${이것.이름}\`;
  }
}

콘솔.출력(인사(이름));`;

test('compileString converts korean keywords to TypeScript', () => {
  const output = compileString(fixture);
  assert.match(output, /const 이름 = "철수";/);
  assert.match(output, /let 나이 = 12;/);
  assert.match(output, /function 인사\(사람이름: string\): string {/);
  assert.match(output, /if \(나이 >= 20\)/);
  assert.match(output, /} else {/);
  assert.match(output, /class 사람 {/);
  assert.match(output, /constructor\(이름: string\)/);
  assert.match(output, /소개\(\): string {/);
  assert.match(output, /console.log\(인사\(이름\)\);/);
});

test('async methods inside class drop function keyword', () => {
  const source = `클래스 서비스 {
  비동기함수 호출(): Promise<문자열> {
    반환 "ok";
  }
}`;
  const output = compileString(source);
  assert.match(output, /async 호출\(\): Promise<string>/);
});
