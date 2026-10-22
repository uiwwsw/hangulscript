# 한글스크립트 (koreanscript)

한글 문장과 키워드로 프로그램을 작성하는 실험적 언어입니다. Python의 들여쓰기와 기본 함수, JavaScript/TypeScript의 표현식과 웹 생태계를 결합합니다. `.ks` 파일을 작성하면 CLI가 동일한 폴더에 `.ts` 파일을 생성해 줍니다.

## 온라인 데모와 공유

[한글스크립트 실행하기](https://koreanscript.vercel.app/)에서 성적 분석기·구구단·인사 예제를 실행할 수 있습니다.
코드를 수정하고 **공유 링크 복사**를 누르면 코드가 포함된 링크를 공유합니다.
수신자는 코드를 읽고 직접 실행합니다. 링크에는 비밀 정보를 넣지 마세요.
**.ks 저장**으로 파일을 내려받아 프로젝트에 사용할 수 있습니다.

```ks
문장으로 시작
점수들은 [75, 92, 88]이다
각 점수를 점수들에서:
    만약 점수 >= 80 이라면:
        출력(점수)
출력("평균:", 합계(점수들) / 길이(점수들))
```

[문장형 문법·기본 함수·설계 방향](LANGUAGE.md)을 참고하세요.
기존 한글 키워드형도 계속 지원합니다. 자유 자연어 해석이나 Python 소스 호환을 제공하지는 않습니다.

## 설치

이 저장소의 패키지명은 `@uiwwsw/koreanscript`입니다. 로컬 소스에서 사용하려면 Node.js 20 이상을 준비한 뒤 의존성을 설치하고 CLI를 빌드합니다.

```bash
git clone https://github.com/uiwwsw/koreanscript.git
cd koreanscript
npm ci
npm run build
npm link
```

`ksc` 실행 파일은 빌드 결과인 `dist/cli.js`를 사용하므로 링크 전에 빌드가 필요합니다. 전역 링크 없이 실행하려면 `node dist/cli.js examples/hello.ks`를 사용할 수 있습니다.

테스트는 `npm test`로 실행합니다. 이 Mac의 Developer workspace에서는 모든 명령을 `./dev`로 실행하세요.

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

## 브라우저와 프로젝트에서 사용

Node 파일 API가 없는 변환 진입점을 제공합니다.

```js
import { compileSource } from '@uiwwsw/koreanscript/browser';
const typescript = compileSource('문장으로 시작\n출력("안녕")');
```

`.ks` → `ksc` → `.ts` → 기존 TypeScript 빌드 순서로 통합합니다.
브라우저에서 임의의 사용자 코드를 부모 페이지나 서버에서 실행하면 안 됩니다.
데모는 별도 origin의 sandbox iframe과 최대 2초 실행 Worker를 사용합니다.

## 웹 데모 개발·Vercel 배포

```bash
./dev npm ci
./dev npm test
./dev npm run build:site
./dev vercel link --project koreanscript
./dev vercel deploy --prod
```

Vercel은 GitHub 저장소에 연결되어 main push로 production을 배포합니다.
공개 산출물은 `site-dist/`입니다. `SITE_URL`을 HTTPS origin으로 지정하면
canonical·Open Graph·robots·sitemap을 다른 도메인으로 빌드할 수 있습니다.
SEO 메타데이터·구조화 데이터·사이트맵을 제공하지만 검색 노출을 보장하지 않습니다.
Google Search Console / 네이버 서치어드바이저 등록에는 별도 소유권 확인이 필요합니다.

## 패키지 배포

`npm test && npm run build && npm pack --dry-run`으로 검증합니다.
현재 공개 npm 게시 여부는 npm registry에서 확인해야 하며 GitHub 릴리스와 별개입니다.
인증된 npm 계정에서 `npm publish --access public`을 실행하거나
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)을 설정합니다.
GitHub Release의 `.tgz`를 내려받아 `npm install ./uiwwsw-koreanscript-0.2.0.tgz`로 설치할 수도 있습니다.
