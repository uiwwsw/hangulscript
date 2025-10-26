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

test('translates extended control flow, module, and type keywords', () => {
  const source = `가져오기 기본모듈 프롬 "./module";
가져오기 { 읽기파일 } 에서 "fs";

스위치 (상태) {
  경우 "start": {
    중단;
  }
  기본: {
    계속;
  }
}

실행 {
  계속;
} 동안 (거짓);

상수 목록 = [1, 2, 3];
상수 객체 = { 삭제: 참 };

반복 (상수 항목 오브 목록) {
  콘솔.출력(항목);
}

반복 (상수 키 안에 객체) {
  만약 (키 === "삭제") {
    삭제 객체[키];
  }
}

함수* 생성기() {
  양보 1;
}

열거형 상태 { 준비, 완료 }

선언 추상 클래스 기초서비스 {
  추상 초기화(): 무효;
}

클래스 서비스 확장 기초서비스 {
  공개 읽기전용 이름: 문자열;
  비공개 정적 인스턴스: 서비스 | 정의안됨;

  생성자(이름: 문자열) {
    상위();
    이것.이름 = 이름;
  }

  초기화(): 무효 {
    반환;
  }

  정적 얻기 기본(): 서비스 | 정의안됨 {
    반환 이것.인스턴스 ?? 정의안됨;
  }

  정적 설정 기본(값: 서비스 | 정의안됨) {
    이것.인스턴스 = 값;
  }
}

상수 구성 = { 모드: "개발" } 만족 { 모드: 문자열 };
타입 구성키 = 키오브 타입오브 구성;
타입 대기값<입력> = 입력 확장 프로미스<인퍼 결과> ? 결과 : 입력;

상수 길이 = "3" 처럼 숫자;
상수 폭 = 4 애즈 숫자;

함수 문자열인지(값: 아무거나): 값 이다 문자열 {
  반환 타입오브 값 === "string";
}

함수 숫자인지(값: 아무거나): 값 이즈 숫자 {
  반환 참;
}

상수 인스턴스 = 새로운 서비스("테스트");
`;
  const output = compileString(source);
  assert.match(output, /import 기본모듈 from "\.\/module";/);
  assert.match(output, /import \{ 읽기파일 \} from "fs";/);
  assert.match(output, /switch \(상태\)/);
  assert.match(output, /case "start":/);
  assert.match(output, /default:/);
  assert.match(output, /break;/);
  assert.match(output, /continue;/);
  assert.match(output, /do {/);
  assert.match(output, /for \(const 항목 of 목록\)/);
  assert.match(output, /for \(const 키 in Object\)/);
  assert.match(output, /delete Object\[키\];/);
  assert.match(output, /function\* 생성기\(\)/);
  assert.match(output, /yield 1;/);
  assert.match(output, /enum 상태 {/);
  assert.match(output, /declare abstract class 기초서비스 {/);
  assert.match(output, /public readonly 이름: string;/);
  assert.match(output, /private static 인스턴스: 서비스 \| undefined;/);
  assert.match(output, /constructor\(이름: string\)/);
  assert.match(output, /super\(\);/);
  assert.match(output, /static get default\(\): 서비스 \| undefined {/);
  assert.match(output, /static set default\(값: 서비스 \| undefined\)/);
  assert.match(output, /const 구성 = \{ 모드: "개발" \} satisfies \{ 모드: string \};/);
  assert.match(output, /type 구성키 = keyof typeof 구성;/);
  assert.match(output, /type 대기값<입력> = 입력 extends Promise<infer 결과> \? 결과 : 입력;/);
  assert.match(output, /const 길이 = "3" as number;/);
  assert.match(output, /const 폭 = 4 as number;/);
  assert.match(output, /function 문자열인지\(값: any\): 값 is string {/);
  assert.match(output, /return typeof 값 === "string";/);
  assert.match(output, /function 숫자인지\(값: any\): 값 is number {/);
  assert.match(output, /const 인스턴스 = new 서비스\("테스트"\);/);
});
