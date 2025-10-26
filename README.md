# 한글스크립트 (koreanscript)

한글 키워드로 TypeScript를 작성할 수 있는 초간단 트랜스파일러입니다. `.ks` 파일을 작성하면 CLI가 동일한 폴더에 `.ts` 파일을 생성해 줍니다.

## 설치

```bash
bun add --global koreanscript
```

(로컬 개발 중이라면 이 저장소를 클론한 뒤 `bun link`를 이용해 전역 설치할 수 있습니다.)

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

타입스크립트처럼 타입 오류를 확인하고 싶다면 `--check` 옵션을 사용할 수 있습니다. 이 모드는 `.ts` 파일을 생성하지 않고 타입 검사 결과만 출력합니다.

```bash
ksc --check src/main.ks
```

> 참고: `--check` 옵션은 내부적으로 TypeScript 컴파일러를 사용하므로, 프로젝트에 `typescript` 패키지가 설치되어 있어야 합니다. (예: `bun add typescript`)

## 지원하는 주요 키워드

### 제어 흐름과 값

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
| 실행 | do |
| 오브 | of |
| 안에 | in |
| 스위치 / 선택 | switch |
| 케이스 / 경우 | case |
| 디폴트 / 기본 | default |
| 중단 / 멈춤 | break |
| 계속 | continue |
| 시도 | try |
| 잡기 | catch |
| 마침내 | finally |
| 던지기 | throw |
| 양보 | yield |
| 삭제 | delete |
| 참 | true |
| 거짓 | false |
| 비어있음 | null |
| 정의안됨 | undefined |

### 모듈과 전역 키워드

| 한글 | JavaScript/TypeScript |
| ---- | --------------------- |
| 가져오기 | import |
| 에서 / 프롬 | from |
| 내보내기 | export |
| 내보내기 기본내보내기 | export default |
| 새로운 | new |
| 이것 | this |
| 상위 | super |
| 대기 | await |
| 콘솔.출력 | console.log |

### 클래스와 타입 시스템

| 한글 | JavaScript/TypeScript |
| ---- | --------------------- |
| 타입 | type |
| 인터페이스 | interface |
| 구현 | implements |
| 확장 | extends |
| 열거형 | enum |
| 클래스 | class |
| 생성자 | constructor |
| 추상 | abstract |
| 공개 | public |
| 보호 | protected |
| 비공개 | private |
| 정적 | static |
| 읽기전용 | readonly |
| 얻기 | get |
| 설정 | set |
| 선언 | declare |

### 타입 연산자

| 한글 | JavaScript/TypeScript |
| ---- | --------------------- |
| 타입오브 | typeof |
| 키오브 | keyof |
| 인퍼 | infer |
| 만족 | satisfies |
| 애즈 / 처럼 | as |
| 이즈 / 이다 | is |
| 무효 | void |

### 기본 타입과 전역 객체

| 한글 | JavaScript/TypeScript |
| ---- | --------------------- |
| 문자열 | string |
| 숫자 | number |
| 불리언 | boolean |
| 아무거나 | any |
| 배열 | Array |
| 레코드 | Record |
| 맵 | Map |
| 세트 | Set |
| 약한맵 | WeakMap |
| 약한세트 | WeakSet |
| 프로미스 | Promise |
| 객체 | Object |
| 날짜 | Date |
| 오류 | Error |
| 정규식 | RegExp |
| 제이슨 | JSON |
| 수학 | Math |

타입 관련 키워드는 위 표 외에도 상황에 맞는 변환이 적용되며, 새로운 키워드가 필요하다면 이 표를 참조해 코드를 작성할 수 있습니다.

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
