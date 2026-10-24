# 한글스크립트 · HangulScript

[![CI on main](https://github.com/uiwwsw/hangulscript/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/uiwwsw/hangulscript/actions/workflows/ci.yml)
[![MIT license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/uiwwsw/hangulscript/blob/main/LICENSE)

**한글 문장으로 작성하고, JavaScript와 타입 선언으로 배포하는 프로그래밍 언어.**

Python의 들여쓰기와 익숙한 기본 함수, JavaScript의 표현식과 웹 생태계,
TypeScript의 타입 검사를 결합합니다. 소스 확장자는 **`.hgs`**입니다.

[온라인에서 실행하기](https://hangulscript.vercel.app/) · [React·Vue 사용법](docs/frameworks.md) · [문법 명세](LANGUAGE.md) · [변경 내역](CHANGELOG.md) · [릴리스](https://github.com/uiwwsw/hangulscript/releases) · [의견 보내기](https://github.com/uiwwsw/hangulscript/issues)

```text
점수들은 [75, 92, 88]이다
각 점수를 점수들에서:
    만약 점수 >= 80 이라면:
        출력(점수)
출력("평균:", 평균(점수들))
```

정해진 한국어 문법을 파싱하며, 임의의 자연어를 추측해 실행하지 않습니다.
Python 소스 호환이나 전체 TypeScript 문법 지원을 뜻하지 않습니다.

## 우리가 꿈꾸는 언어

한글스크립트는 누구나 익숙한 우리말로 생각을 표현하고, 그 생각을 프로그램으로 만들어 갈 수 있는 언어를 꿈꿉니다. 낯선 기호와 딱딱한 표현 앞에서 망설이던 사람도 따뜻한 문장으로 개발의 즐거움을 느낄 수 있도록. 많은 사람에게 오래 사랑받는 언어로, 한 문장씩 함께 만들어 가겠습니다.

마지막 목표는 함수 이름을 한글로 바꾸는 데서 더 나아가, “3 더하기 5는?”, “1부터 10까지 다 합치면?”처럼 자연스러운 한글 문장으로 프로그램을 작성하는 것입니다. 아직 구현되지 않은 목표이며, 현재 지원 범위와 앞으로의 방향은 [개발 로드맵](https://hangulscript.vercel.app/docs/roadmap/)에서 확인할 수 있습니다.

자연어 계산·조건·정중 표현과 Windows 어댑터의 향후 방향은 [문법 확장 설계 제안](docs/design/natural-language.md)에서 논의합니다. 새 표현은 아직 구현되지 않았습니다.

## 지금 만들 수 있는 것

| 예제 | 바꿀 수 있는 값 | 사용하는 기능 |
| --- | --- | --- |
| [사칙연산 계산기](examples/calculator.hgs) | 두 숫자·연산 | 함수·조건·0 나눗셈 처리 |
| [할인 계산기](examples/discount.hgs) | 가격·할인율 | 범위 검사·반올림 |
| [숫자 통계](examples/statistics.hgs) | 쉼표로 구분한 숫자 | 합계·평균·최솟값·최댓값 |
| [문자열 정리기](examples/text.hgs) | 단어 목록 | 공백 정리·중복 제거·연결 |
| [성적 분석기](examples/scores.hgs) | 점수 목록 | 반복·필터링·정렬 |
| [타입 있는 함수 모듈](examples/math-library.hgs) | 함수·타입 | JS + .d.ts 라이브러리 빌드 |

데모에서 예제를 선택하고 입력값을 바꾼 다음 **실행하기**를 누르세요. 변환 결과는 기본적으로 JavaScript로 표시하며, 선택 메뉴에서 TypeScript와 비교할 수 있습니다. 출력과 오류는 플레이그라운드를 스크롤하는 동안 화면 하단에 고정된 콘솔에 표시됩니다. 데모의 변환된 JavaScript는 실제 실행 코드와 같으며, 필요한 기본 함수 정의도 포함하므로 숨겨진 함수에 의존하지 않습니다. 일반적인 `출력(...)` 호출은 `console.log(...)`로 표시합니다. UI 예제는 데모의 화면 연결 환경이 필요합니다. CLI 빌드는 JavaScript와 `.d.ts`를 함께 생성합니다.
화면 예제에서는 입력값을 바꾸고 도구 안의 버튼을 누르면 현재 값으로 프로그램을 다시 실행합니다.
데모의 선택형 UI 예제는 입력창·선택창·버튼을 제공하며 결과는 콘솔에 표시합니다. 데이터베이스·외부 API는 제공하지 않습니다.
생성한 JS를 기존 웹/Node 프로젝트에 연결해 화면과 서비스를 확장할 수 있습니다.

## 설치

Node.js **20.19 이상**이 필요합니다. 아래의 JS + .d.ts 빌드와 `run` 명령은 **0.3.0부터** 제공합니다.
공개된 버전은 [npm](https://www.npmjs.com/package/@uiwwsw/hangulscript) 또는 `npm view @uiwwsw/hangulscript version`으로 확인하세요.

```bash
npm install --save-dev @uiwwsw/hangulscript
```

소스에서 최신 버전을 사용하려면:

```bash
git clone https://github.com/uiwwsw/hangulscript.git
cd hangulscript
npm ci
npm run build
node dist/cli.js run examples/calculator.hgs
```

## 직접 실행과 빌드

```bash
# .hgs를 바로 실행: 중간 파일을 만들지 않음
npx ksc run examples/calculator.hgs

# 기본 출력은 .js + .d.ts
npx ksc build examples/math-library.hgs --out-dir output
# output/math-library.js
# output/math-library.d.ts

# build 생략 가능
npx ksc examples/math-library.hgs --out-dir output

# 타입 검사만 수행
npx ksc --check examples/math-library.hgs

# 기존 .ts 출력이 필요할 때
npx ksc --typescript examples/math-library.hgs --out-dir output
```

**0.2에서 변경:** CLI의 기본 출력이 `.ts`에서 **`.js` + `.d.ts`**로 바뀝니다.
중간 TypeScript를 확인하려면 `--typescript`를 추가하세요. 소스는 문장형 하나만 지원합니다.
`compileSource`·`compileString` API는 기존처럼 TypeScript 문자열을 반환합니다.

`run`은 신뢰하는 코드를 로컬 Node.js에서 실행합니다. 온라인 데모와 달리 격리·2초 제한이 없습니다.
프로그램 인자는 `ksc run 파일.hgs -- 인자1 인자2`처럼 전달합니다.

### 배포 산출물 사용

```text
더함(가: 숫자, 나: 숫자)를 정의한다:
    돌려주기 가 + 나
더함을 공개한다
```

생성한 `.js`에는 실행 코드가, `.d.ts`에는 다음과 같은 타입 계약이 담깁니다.

```ts
declare function 더함(가: number, 나: number): number;
export { 더함 };
```

```js
import { 더함 } from './output/math-library.js';
console.log(더함(2, 3)); // 5
```

출력은 **ES Modules**입니다. Node 프로젝트에는 `package.json`의 `"type": "module"`을 설정하거나
ESM을 지원하는 번들러를 사용하세요. JS와 .d.ts를 함께 배포하면 TypeScript 사용자가 타입을 읽을 수 있습니다.
`.d.ts`는 실행 파일이 아닙니다. 함수 인자 타입을 생략하면 `any`가 되므로
공개 라이브러리 함수에는 타입을 명시하는 편이 좋습니다.
여러 `.hgs` 파일의 import 경로를 자동으로 묶거나 재작성하지는 않습니다.

## 문장형 문법

문장형이 유일한 기본 문법입니다. 별도의 시작 문장 없이 첫 줄부터 작성합니다.

```text
이름은 "하늘"이다
횟수는 3이다

인사(누구: 문자열)를 정의한다:
    돌려주기 "안녕, " + 누구

각 순서를 범위(횟수)에서:
    만약 순서 == 0 이라면:
        출력("첫 인사")
    아니면:
        출력(인사(이름))
```

- 선언: `이름은 값이다` 또는 `이름는 값이다`. 재대입은 `이름 = 값`.
- 함수: `인사(누구)를 정의한다:`와 `돌려주기 값`.
- 조건: `만약 식 이라면:` → `아니고 식 이라면:` → `아니면:`.
- 반복: `각 항목을 목록에서:`와 `동안 식:`. `멈추기`, `계속하기` 지원.
- 블록은 콜론 뒤에 공백으로 들여씁니다. 탭은 허용하지 않습니다.
- 행 전체 주석은 `#`입니다. 표현식은 JS의 연산자·배열·객체를 사용합니다.

지원 범위와 제약은 [LANGUAGE.md](LANGUAGE.md)에 정리했습니다.

## 한글 기본 함수

문장형 파일에는 다음 함수가 제공됩니다.

| 함수 | 예시 / 의미 |
| --- | --- |
| `출력` | `출력("합계:", 30)` |
| `길이` | 문자열의 UTF-16 코드 단위 수 또는 목록 항목 수 |
| `추가` | `추가(목록, 값)` — 원본 목록 변경 |
| `포함` | `포함(목록, 값)` — 포함 여부 |
| `나누기` | `나누기("가,나", ",")` |
| `잇기` | `잇기(["가", "나"], " · ")` |
| `다듬기` | 문자열 양 끝 공백 제거 |
| `숫자로` | 유한한 숫자로 변환, 빈 문자열·잘못된 값은 오류 |
| `합계` | 숫자 목록 합산 |
| `평균` | 숫자 목록 평균, 빈 목록은 오류 |
| `최솟값` / `최댓값` | 목록을 순회해 계산, 빈 목록은 오류 |
| `반올림` | `반올림(12.345, 2)` — 자리 -10~10 |
| `정렬` | 숫자 목록을 복사해 오름차순 정렬 |
| `범위` | `범위(5)`, `범위(1, 5)`, `범위(5, 0, -1)` — 끝 제외 |

계산은 JS의 부동소수점 규칙을 따릅니다. 예를 들어 `0.1 + 0.2`의 정밀도는
이 언어에서도 달라지지 않습니다. 금액은 원·센트 같은 정수 단위로 다루세요.
`반올림`은 JS `Math.round` 규칙이며 임의 정밀도 십진 연산이 아닙니다.

## 공유

1. 데모에서 예제를 수정하고 실행 결과를 확인합니다.
2. **공유 링크 복사**로 코드를 담은 URL을 전달합니다.
3. 받는 사람은 코드를 읽고 직접 실행합니다. 링크를 열기만 해서는 실행되지 않습니다.
4. **.hgs 저장**으로 소스를 내려받아 CLI에서 실행하거나 JS + .d.ts로 배포합니다.

코드는 URL의 `#code=` 조각에 담깁니다. 서버 저장소·공개 코드 목록 기능은 없습니다.
링크를 가진 사람이 코드를 읽을 수 있으므로 비밀번호·토큰·개인정보는 넣지 마세요.

## 성능과 실행 제한

0.3에서 다음 개선을 적용했습니다.

- **컴파일 전용 Worker:** TypeScript 파싱·변환·출력 정리를 UI 스레드 밖에서 실행.
- **180ms 입력 지연과 결과 재사용:** 키를 누를 때마다 변환하지 않고, 같은 소스는 다시 컴파일하지 않음.
- **단일 문장형 파서:** 모드 자동 감지·키워드 치환·클래스 사후 보정을 제거하고 문장 블록을 직접 생성.
- **실행 출력 제한:** 부모 페이지에서도 최대 100행·행당 1,000자로 제한.
- **범위 제한:** `범위`는 최대 100,000개 항목. 최솟값·최댓값은 인자 펼치기 없이 순회.

성능은 `npm run benchmark`로 1,000행 문장형 선언의 변환 시간과 현재 번들 크기를 측정할 수 있습니다.
Worker 분리는 UI의 파싱·실행 부담을 분리하지만 전체 다운로드를 제거하지 않습니다.
첫 로딩은 네트워크와 기기에 따라 느릴 수 있습니다.

```bash
npm run build:site
npm run benchmark
```

온라인 실행은 별도 origin의 sandbox iframe과 Worker에서 최대 2초 동안 수행합니다.
네트워크·DOM·외부 모듈은 제공하지 않으며 입력은 30,000자로 제한합니다.
이는 완전한 메모리 할당 제한이 아닙니다. 매우 큰 배열 등은 Worker에서도 메모리를 많이 사용할 수 있습니다.
대용량 작업·프로덕션 서버용 성능을 검증한 단계는 아닙니다.

## 프로그래밍 API

```js
import { buildSource, lintSource } from '@uiwwsw/hangulscript';

const source = '출력(합계([1, 2, 3]))';
const { javascript, declaration } = buildSource(source);
const { hasErrors } = lintSource(source);
```

Node 파일 API 없이 변환만 필요하면:

```js
import { compileSource } from '@uiwwsw/hangulscript/browser';
const typescript = compileSource('출력("안녕")');
```

이 진입점도 TypeScript 스캐너를 포함합니다. 브라우저에서는 데모처럼 Worker에서 사용하세요.
루트와 브라우저 진입점 모두 패키지의 `.d.ts`를 제공합니다.

## 개발·배포

```bash
npm ci
npm test
npm run build
npm run build:site
npm pack --dry-run
```

Vercel은 GitHub main과 연결되어 `site-dist/`를 배포합니다.
`SITE_URL`에 HTTPS origin을 지정하면 canonical·Open Graph·robots·sitemap 주소를 바꿀 수 있습니다.

Vite 연동을 제공합니다. 독립 AST·원본 `.hgs` 소스맵·LSP·모듈 그래프는 향후 과제입니다.

## 라이선스

[MIT](LICENSE)

## 이름과 확장자

제품명은 한글스크립트(HangulScript), 패키지는 `@uiwwsw/hangulscript`입니다.
0.6부터 소스 확장자는 `.hgs`만 지원하며 키워드형과 시작 표기를 제거했습니다. 기존 코드는 [문법 명세](LANGUAGE.md)의 문장형으로 옮겨야 합니다.
이전 패키지에서 이동하려면 `npm uninstall @uiwwsw/koreanscript` 후 새 패키지를 설치하세요.


## 입력창과 버튼으로 도구 만들기

온라인 데모의 계산기·할인·통계·문자열 예제는 코드에 선언한 실제 화면을 제공합니다.

```text
가격은 숫자입력("상품 가격", 10000)이다
할인율은 숫자입력("할인율", 20)이다

"계산하기" 버튼을 누르면:
    결과는 가격 * (1 - 할인율 / 100)이다
    보여주기("결제 금액", 결과)
```

`숫자입력`, `글자입력`, `선택입력`, `버튼`, `보여주기`를 지원합니다.
버튼을 누르면 현재 입력값과 누른 버튼 이름을 전달하여 프로그램을 처음부터 다시 실행합니다.
일반 변수는 실행 사이에 유지되지 않으며 입력값은 같은 화면을 사용하는 동안 유지됩니다.
화면 요소 이름은 중복할 수 없고, 한 실행당 최대 40개입니다.
공유받은 코드는 실행 버튼을 눌러야 시작합니다. 공유 링크에는 코드와 코드의 기본값이 담기며, 미리보기에서 바꾼 입력값은 포함하지 않습니다.

이 화면 함수는 데모의 UI 실행 환경이 필요합니다. Node CLI에서 직접 실행하거나 React/Vue 컴포넌트 안에 넣는 것으로 화면이 생성되지는 않습니다.
사용자 코드는 격리된 Worker에서 실행하고, 호스트는 제한된 데이터만 받아 입력창을 만들고 결과를 콘솔에 표시합니다.
HTML·이벤트 핸들러 문자열을 삽입하지 않습니다.

## React·Vue에서 .hgs 가져오기

**0.6.0 이상**의 공통 Vite 플러그인을 사용합니다. React/Vue의 화면과 상태 관리에 한글스크립트 계산·검증 함수를 연결할 수 있습니다.

```bash
npm install --save-dev @uiwwsw/hangulscript@^0.8.0
```

```js
// vite.config.js — React
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import hangulscript from '@uiwwsw/hangulscript/vite';

export default defineConfig({ plugins: [hangulscript(), react()] });
```

Vue에서는 `@vitejs/plugin-vue`에서 `vue`를 가져와 `[hangulscript(), vue()]`로 설정합니다.

```text
결제금액(가격: number, 할인율: number)를 정의한다:
    돌려주기 가격 - 반올림(가격 * 할인율 / 100)
결제금액을 공개한다
```

```js
import { 결제금액 } from './discount.hgs';
console.log(결제금액(10000, 20)); // 8000
```

완성된 **입력창 → 버튼 → 계산 결과** 예제와 React JSX·Vue SFC 전체 코드를 제공합니다.

- [React·Vue 단계별 사용 안내](docs/frameworks.md): 설치·설정·한글 함수·컴포넌트 연결·TypeScript 사용법
- [실행 가능한 React 예제](examples/react-vite): 해당 폴더에서 `npm ci` → `npm run dev`
- [실행 가능한 Vue 예제](examples/vue-vite): 해당 폴더에서 `npm ci` → `npm run dev`
- [온라인 연동 안내](https://hangulscript.vercel.app/#frameworks)

예제는 Node.js `^20.19.0 || >=22.12.0`이 필요하며 Node.js 24에서 검증했습니다.
**0.7.0부터** Vite 플러그인은 구문·타입 오류가 있으면 개발 서버와 빌드를 실패시키고 원본 `.hgs` 위치를 표시합니다. 선언 생성·디버깅 소스맵은 제공하지 않습니다. TypeScript 프로젝트는 `ksc build`로 생성한 `.js`와 `.d.ts`를 가져오는 방식이 적합합니다.
데모의 UI 문장을 React/Vue 컴포넌트로 자동 변환하는 기능은 포함하지 않습니다.

## VS Code 확장

문법 강조·자동 들여쓰기·문서 포맷·Problems 오류 표시·타입 정보·정의 이동·스코프 자동 완성을 제공하는 확장을 같은 저장소의 [`extensions/vscode`](extensions/vscode)에서 개발합니다. [설치·저장 시 포맷·Marketplace 게시 안내](extensions/vscode/README.md)를 참고하세요. VSIX 패키지와 Marketplace 공개는 별도 단계입니다.

## 공식 도구와 지원 범위

Node에서 직접 실행하려면 `node --import @uiwwsw/hangulscript/register src/main.hgs`를 사용합니다. `ksc run`도 같은 로더를 사용하며 상대 경로 `.hgs` import를 처리합니다. `ksc build`는 진입 폴더 아래 HGS 모듈을 함께 빌드하고 import를 `.js`로 연결합니다.

[환경별 지원 계약·타입 설정·호환성 정책](docs/support.md)을 확인하세요. 언어 패키지와 VS Code 확장은 같은 저장소에서 검증하며 별도 버전으로 배포합니다.

## 문서와 자료구조

[공식 문서](https://hangulscript.vercel.app/docs/)는 시작하기·문법·자료구조·모듈·프레임워크·편집기·오류 해결을 페이지별로 제공합니다. [61개 표준 함수](https://hangulscript.vercel.app/docs/standard-library/)에는 타입·실행 예제·원본 변경 여부가 있습니다.

```text
점수들은 [88, 92, 88]이다
점수순은 점수들을 내림차순으로 정렬한 값이다
고유값은 점수들에서 중복을 제거한 값이다
독립본은 점수들을 깊게 복사한 값이다
출력(점수순, 고유값, 독립본)
```

목록의 변환·검색·누적·펼치기, 집합 연산, 사전(Map), 얕은·깊은 복사, 안정적인 기준 정렬을 제공합니다. 전체 JS API를 한글화한 상태는 아니며 [지원 범위](docs/support.md)에 제약을 명시합니다.

[한글스크립트의 큰 그림과 로드맵](https://hangulscript.vercel.app/docs/roadmap/)에서 현재 지원·부분 지원·미구현과 다음 개발 순서를 확인하세요.

## 릴리스 자동화

언어 패키지는 `vX.Y.Z`, VS Code 확장은 `vscode-vX.Y.Z` GitHub Release로 각각 게시합니다. 테스트·빌드 후 검증한 아카이브를 사용하며, 확장은 게시 없는 시험 실행도 지원합니다. [릴리스 가이드](docs/publishing.md)를 확인하세요.

온라인 입문: [설치 없이 한글로 코딩하기](https://hangulscript.vercel.app/docs/online/) · [반복문 예제](https://hangulscript.vercel.app/docs/loops/) · [함수 예제](https://hangulscript.vercel.app/docs/functions/)

AI 학습·미세조정 및 학습용 데이터 수집에 대한 권리자 의사는 [AI 이용 고지 / AI use notice](AI-TRAINING-NOTICE.md)를 참고하세요.
