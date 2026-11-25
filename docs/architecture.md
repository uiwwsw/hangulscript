# 구성과 의존 프로젝트

이 문서는 한글스크립트가 내부에서 무엇을 하고, 어떤 프로젝트를 그대로 가져다 쓰며, 무엇을 직접 작성했는지 정리합니다. 소스는 이 저장소의 `src/`, `scripts/`, `site/`, `extensions/vscode/`에서 확인할 수 있습니다.

## 한 줄 요약

한글스크립트는 `.hgs` 파일의 한글 문장을 **줄 단위 규칙으로 TypeScript 소스 문자열로 바꾸는 변환기**입니다. 타입 검사와 JavaScript·`.d.ts` 생성은 **TypeScript 컴파일러(`typescript` 패키지)가 수행합니다.** 독립적인 파서 생성기, 타입 검사기, 가상 머신, 코드 생성기는 없습니다.

```text
.hgs 소스
  │  src/sentences.js, src/expressions.js   (직접 작성한 변환 규칙)
  ▼
TypeScript 소스 문자열 + 줄 대응표 (HGS 줄 ↔ 생성된 줄)
  │  src/checker.js                         (TypeScript Program · TypeChecker)
  ▼
진단(오류·경고)  ──  src/diagnostics.js에서 원본 .hgs 위치로 환산
  │  src/emitter.js                         (TypeScript emit)
  ▼
JavaScript(ESM) + .d.ts
```

## 직접 작성한 것과 가져다 쓴 것

| 구분 | 내용 |
| --- | --- |
| 직접 작성 | 문장형 문법(`~는 ~이다`, `~를 정의한다:`, `만약 ~ 이라면:` 등)과 이를 TypeScript로 바꾸는 규칙, 한글 타입 이름 매핑, 기본 함수 61개의 정의, 진단 위치 환산, 포맷터, Node 로더, Vite 플러그인, 화면 입력 브리지, VS Code 확장 연결 코드 |
| TypeScript에 위임 | 토큰화와 표현식 파싱, 타입 검사, 제네릭·추론, 모듈 해석, 오류 메시지 본문(영문), JavaScript와 `.d.ts` 생성, 개발 시 타입 정보·정의 이동·자동 완성에 쓰는 심볼 조회 |
| 언어 의미 | 표현식과 연산자는 JavaScript 그대로입니다. 숫자는 JS의 `Number`, 반올림은 `Math.round`입니다. 한글 이름이 붙은 부분은 문장 구조, 일부 리터럴(`참`, `거짓`, `비어있음`, `정의안됨`, `자신`, `부모`)과 타입 이름(`숫자`, `문자열` 등), 기본 함수뿐입니다 |
| 원본 위치 | 소스맵은 없습니다. 오류 위치는 줄 대응표와 문자열 검색으로 추정하므로 같은 줄에서 열이 어긋날 수 있습니다 |

## `src/` 모듈별 역할

| 파일 | 역할 |
| --- | --- |
| `sentences.js` | 핵심 변환기. 소스를 한 줄씩 읽고, 들여쓰기 깊이로 블록을 열고 닫으며, 정규식으로 문장 유형을 판별해 TypeScript 한 줄 또는 블록 머리를 출력합니다. 전용 AST를 만들지 않습니다. 들여쓰기는 공백만 허용하며 Python처럼 들여쓰기로 블록을 나눕니다. 생성된 줄이 원본 몇 번째 줄인지 `lineMap`으로 함께 돌려줍니다 |
| `expressions.js` | 한 줄 안의 표현식을 다룹니다. `typescript`의 `createSourceFile`로 파싱해 식별자 노드만 골라 `참`→`true`, `숫자`→`number` 같은 치환을 합니다. 함수 시그니처는 TypeScript 파서로 매개변수를 분해해 타입이 없으면 `any`를 붙입니다. 「~를 오름차순으로 정렬한 값」 같은 정해진 문구 세 가지도 여기서 함수 호출로 바꿉니다 |
| `transformer.js` | `sentences.js`를 감싼 공개 진입점(`compileSource`, `compileMappedSource`). Node 내장 모듈을 가져오지 않으므로 브라우저에서 쓸 수 있습니다 |
| `runtime.js`, `collections.js`, `ui.js` | 기본 함수의 TypeScript 소스 문자열입니다. 변환 결과 앞에 붙어 함께 검사·출력됩니다. 대부분 `Array`, `Set`, `Map`, `structuredClone` 같은 JS 내장 기능의 한글 이름 래퍼이며 일부(`숫자로`, `반올림`, `범위`, 정렬)는 입력 검증과 오류 메시지를 추가합니다. `ui.js`는 입력창·버튼·결과 표시를 데이터 객체로만 주고받는 브리지입니다 |
| `checker.js` | `ts.createProgram`으로 변환된 TypeScript를 검사합니다. 가상 파일 시스템(`원본.hgs.ts`)과 `.hgs` 모듈 해석, 가까운 `tsconfig.json` 읽기, 기본 옵션(`strict`, `skipLibCheck`, ES2022, ESNext 모듈, Bundler 해석)을 설정합니다. 타입 오류는 모두 TypeScript가 보고한 것이며, 문법 오류(`HGS1001`)만 변환기가 보고합니다 |
| `diagnostics.js` | TypeScript 진단을 원본 `.hgs`의 줄·열로 옮기고, 자주 만나는 오류 코드 몇 가지에 한국어 힌트를 덧붙입니다 |
| `emitter.js` | 검사를 통과한 Program에서 JS와 `.d.ts`를 `emit`합니다. `.hgs` import 경로를 `.js`로 바꾸는 TypeScript transformer를 하나 끼워 넣습니다 |
| `index.js` | Node용 공개 API(`buildSource`, `buildFile`, `lintSource`, `checkSource`, `compileSource` 등)와 파일 쓰기 |
| `cli.js` | `ksc` 명령. `run`, `build`, `--check`, `--typescript` |
| `loader.js`, `register.js` | Node의 모듈 후크(`node:module`의 `register`). `.hgs`를 읽어 검사한 뒤 `ts.transpileModule`로 JS로 바꿔 돌려줍니다 |
| `vite.js` | 외부 의존 없는 Vite 플러그인 객체. `transform`에서 검사하고 `ts.transpileModule`로 변환합니다. 소스맵과 선언 파일은 만들지 않습니다 |
| `formatter.js` | 들여쓰기 폭과 빈 줄을 정리하는 포맷터. 변환기로 문법을 확인한 뒤 공백만 바꾸고 식은 다시 쓰지 않습니다 |
| `editor.js` | 편집기용 분석. TypeScript의 TypeChecker로 커서 위치의 타입, 정의 위치, 스코프 내 이름 목록을 조회합니다 |
| `*.d.ts` | 공개 진입점의 타입 선언 |

`npm run build`(`scripts/build.js`)는 `src/`를 `dist/`로 복사할 뿐이며 번들링·최소화는 하지 않습니다.

패키지 진입점은 다음과 같습니다.

| 경로 | 내용 |
| --- | --- |
| `@uiwwsw/hangulscript` | `index.js`. Node API |
| `@uiwwsw/hangulscript/browser` | `transformer.js`. 변환만 수행(타입 검사 없음) |
| `@uiwwsw/hangulscript/vite` | Vite 플러그인 |
| `@uiwwsw/hangulscript/formatter` | 포맷터 |
| `@uiwwsw/hangulscript/editor` | 편집기용 분석 |
| `@uiwwsw/hangulscript/register` | Node 로더 등록 |

## 의존 패키지

| 패키지 | 구분 | 쓰임 | 이유 |
| --- | --- | --- | --- |
| [`typescript`](https://github.com/microsoft/TypeScript) (Apache-2.0) | 런타임 | 파싱, 타입 검사, JS·`.d.ts` 생성, 편집기 심볼 조회 | 타입 시스템을 새로 만들지 않고 기존 JS 생태계의 타입 계약을 그대로 쓰기 위해서입니다 |
| [`esbuild`](https://github.com/evanw/esbuild) | 개발 | 웹사이트 번들과 VS Code 확장 번들 | 빌드 도구. npm 패키지에는 포함되지 않습니다 |
| [`marked`](https://github.com/markedjs/marked) | 개발 | 문서 사이트의 마크다운을 HTML로 변환 | 사이트 빌드 전용 |
| [`@vscode/vsce`](https://github.com/microsoft/vscode-vsce) | 개발 | 확장 `.vsix` 패키징·게시 | 확장 배포 전용 |
| [`@vscode/test-electron`](https://github.com/microsoft/vscode-test) | 개발 | 실제 VS Code에서 확장 테스트 | 확장 검증 전용 |

사이트 글꼴은 SUNN의 [SUITE](https://sun.fo/suite/)(SIL Open Font License 1.1, `site/fonts/LICENSE`)입니다. PEG·Ohm 같은 파서 생성기나 Babel·Acorn 같은 다른 JS 파서는 쓰지 않습니다.

## 웹사이트와 플레이그라운드 (`site/`, `scripts/`)

| 파일 | 역할 |
| --- | --- |
| `site/app.js`, `home.js`, `docs.js` | 플레이그라운드·홈·문서 페이지 동작 |
| `site/compiler-worker.js`, `browser-checker.js` | 브라우저 Worker에서 `typescript`로 변환·검사. 타입 라이브러리(`lib.es2022.d.ts`)는 빌드 때 `scripts/type-libraries.js`가 모아 둡니다 |
| `site/emitted-code.js` | 화면에 보여 줄 JavaScript를 만들고, 쓰이지 않는 기본 함수를 제외합니다 |
| `site/runner.html`, `runner.js` | 실행 전용 iframe. 사용자 코드는 Worker에서 최대 2초 실행하며 부모 페이지에 접근하지 못합니다 |
| `site/usage-analytics.js` | 방문 통계. 브라우저에서 동의를 선택한 뒤에만 동작합니다 |
| `scripts/build-site.js`, `build-docs.js`, `standard-catalog.js` | 사이트와 문서 HTML, 표준 함수 목록 생성 |
| `scripts/benchmark.js` | 변환 시간 측정 |
| `scripts/build-vscode.js`, `run-editor-qa.js`, `release-metadata.js`, `verify-marketplace.js` | 확장 번들·테스트·릴리스 검증 |

## VS Code 확장 (`extensions/vscode/`)

| 파일 | 역할 |
| --- | --- |
| `src/extension.js` | 진단 표시, 포맷 제공자, hover·정의 이동·자동 완성 제공자를 VS Code API에 연결합니다. 포맷은 `src/formatter.js`를 그대로 씁니다 |
| `src/diagnostic-worker.js` | 별도 스레드에서 `src/checker.js`·`src/editor.js`를 호출합니다. 즉 확장의 타입 검사도 TypeScript가 합니다 |
| `syntaxes/hangulscript.tmLanguage.json` | [TextMate 문법](https://macromates.com/manual/en/language_grammars) 형식의 구문 강조 |
| `snippets.json`, `language-configuration.json`, `icons/` | 스니펫, 괄호·주석 설정, 아이콘 |
| `qa/host.cjs` | 실제 VS Code 안에서 도는 시험 코드 |

확장은 esbuild로 번들되며 TypeScript의 기본 `lib` 선언 파일을 함께 넣어 Node 설치 없이 동작합니다. 별도 언어 서버(LSP)는 없고 위 기능을 확장 프로세스와 Worker가 직접 제공합니다.

## 참고하거나 닮은 프로젝트

| 프로젝트 | 관계 |
| --- | --- |
| [TypeScript](https://www.typescriptlang.org/) | 위에서 설명한 대로 타입 검사와 코드 생성을 맡습니다. 한글스크립트는 TypeScript의 상위 언어가 아니라 TypeScript를 생성하는 앞단입니다 |
| [JavaScript / ECMAScript](https://tc39.es/ecma262/) | 표현식·연산자·내장 객체·모듈이 그대로 JS입니다 |
| [Python](https://www.python.org/) | 들여쓰기로 블록을 나누고 콜론으로 블록을 여는 모양을 참고했습니다. 문법·의미·표준 라이브러리는 Python과 호환되지 않습니다 |
| [VS Code](https://code.visualstudio.com/) · [Vite](https://vite.dev/) | 편집기 확장과 번들러 플러그인의 대상 환경입니다 |
| [아희(Aheui)](https://aheui.readthedocs.io/) | 한글 글자로 프로그램을 쓰는 난해한 언어입니다. 같은 한글 프로그래밍 언어 범주에 속하지만 설계 목적이 다르고 코드·문법을 가져오지 않았습니다 |

한국어로 프로그래밍하는 시도는 이전에도 여러 번 있었습니다. 이 저장소는 그 가운데 아희 외의 언어와 코드를 공유하지 않으며, 설계에서 참고했다고 확인할 수 있는 자료도 없으므로 이름을 나열하지 않습니다.

## 한계

- 줄 단위 정규식 변환기이므로 문장 하나가 여러 줄에 걸치는 형태는 지원하지 않습니다. 표현식은 JavaScript 문법이며 한국어 문장을 해석하지 않습니다(예외: 위의 정해진 문구 세 가지).
- 타입 검사의 강도와 한계는 TypeScript의 것입니다. 매개변수 타입을 생략하면 `any`가 되어 그 값은 엄격히 검사되지 않습니다.
- 소스맵, 전용 AST, 오류 복구(한 번에 여러 문법 오류 표시), LSP, 번들링은 아직 없습니다. 로드맵은 [큰 그림과 로드맵](ROADMAP.md)에 있습니다.
- 생성된 JavaScript는 TypeScript가 만든 것이므로 가독성·성능은 TypeScript 출력 수준이며 별도 최적화가 없습니다.
