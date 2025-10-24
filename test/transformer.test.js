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

test('translates new keyword and common globals', () => {
  const source = `상수 자료 = 새로운 맵<문자열, 숫자>();
상수 값 = 새로운 객체();
상수 집합 = 새로운 세트<숫자>();
상수 약맵 = 새로운 약한맵();
상수 약세트 = 새로운 약한세트();
상수 약속 = 새로운 프로미스<문자열>((완료) => 완료("ok"));
상수 오늘 = 새로운 날짜();
상수 오류값 = 새로운 오류("문제");
상수 정규식값 = 새로운 정규식("a");
상수 데이터 = 제이슨;
상수 최대값 = 수학;`;
  const output = compileString(source);
  assert.match(output, /const 자료 = new Map<string, number>\(\);/);
  assert.match(output, /const 값 = new Object\(\);/);
  assert.match(output, /const 집합 = new Set<number>\(\);/);
  assert.match(output, /const 약맵 = new WeakMap\(\);/);
  assert.match(output, /const 약세트 = new WeakSet\(\);/);
  assert.match(output, /const 약속 = new Promise<string>\(/);
  assert.match(output, /const 오늘 = new Date\(\);/);
  assert.match(output, /const 오류값 = new Error\("문제"\);/);
  assert.match(output, /const 정규식값 = new RegExp\("a"\);/);
  assert.match(output, /const 데이터 = JSON;/);
  assert.match(output, /const 최대값 = Math;/);
});
