# 한글스크립트 (koreanscript)

한글 키워드로 TypeScript를 작성할 수 있는 초간단 트랜스파일러입니다. `.ks` 파일을 작성하면 CLI가 동일한 폴더에 `.ts` 파일을 생성해 줍니다.

## 설치

```bash
npm install koreanscript
```

(로컬 개발 중이라면 이 저장소를 클론한 뒤 `npm link`를 이용해 전역 설치할 수 있습니다.)

## 사용법

1. `*.ks` 파일을 만듭니다.
2. CLI를 실행해 `.ts` 파일로 변환합니다.

```bash
ksc examples/hello.ks
# ✅ examples/hello.ts 생성됨
```

여러 개의 파일을 한 번에 변환할 수도 있고, `--out-dir` 옵션으로 결과물을 다른 폴더에 저장할 수도 있습니다.

```bash
ksc --out-dir dist src/main.ks src/utils.ks
```

## 지원하는 주요 키워드

| 한글 | JavaScript/TypeScript |
| ---- | --------------------- |
| 상수 | const |
| 변수 | let |
| 함수 | function |
| 비동기함수 | async function |
| 반환 | return |
| 만약 | if |
| 아니면 | else |
| 반복 | for |
| 동안 | while |
| 참 | true |
| 거짓 | false |
| 비어있음 | null |
| 정의안됨 | undefined |
| 가져오기 | import |
| 내보내기 | export |
| 내보내기 기본내보내기 | export default |
| 타입 | type |
| 인터페이스 | interface |
| 구현 | implements |
| 확장 | extends |
| 클래스 | class |
| 생성자 | constructor |
| 이것 | this |
| 대기 | await |
| 시도/잡기/던지기 | try/catch/throw |
| 콘솔.출력 | console.log |

타입 키워드도 기본적으로 지원합니다. (문자열 → string, 숫자 → number, 불리언 → boolean, 아무거나 → any, 배열 → Array, 레코드 → Record)

## 예시

`examples/hello.ks`

```ks
상수 이름 = "철수";

함수 인사(사람이름: 문자열): 문자열 {
  반환 `안녕 ${사람이름}!`;
}

콘솔.출력(인사(이름));
```

`ksc examples/hello.ks` 실행 후 생성되는 `examples/hello.ts`

```ts
const 이름 = "철수";

function 인사(사람이름: string): string {
  return `안녕 ${사람이름}!`;
}

console.log(인사(이름));
```

## 라이선스

MIT
