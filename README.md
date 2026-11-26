<div align="center">

<img src="https://raw.githubusercontent.com/uiwwsw/hangulscript/main/site/icon.svg" alt="한글스크립트 로고" width="80" height="80">

<h1>한글스크립트 · HangulScript</h1>

<p>한글 문장으로 쓴 <code>.hgs</code> 소스를 TypeScript로 변환하고, TypeScript 컴파일러로 타입을 검사해 JavaScript와 <code>.d.ts</code>를 만드는 실험적 변환기입니다.</p>

[![npm](https://img.shields.io/npm/v/@uiwwsw/hangulscript?style=flat-square)](https://www.npmjs.com/package/@uiwwsw/hangulscript)
[![license](https://img.shields.io/github/license/uiwwsw/hangulscript?style=flat-square)](https://github.com/uiwwsw/hangulscript/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/uiwwsw/hangulscript/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/uiwwsw/hangulscript/actions/workflows/ci.yml)
[![node](https://img.shields.io/node/v/@uiwwsw/hangulscript?style=flat-square)](https://nodejs.org/)
[![built on TypeScript](https://img.shields.io/badge/built%20on-TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://github.com/microsoft/TypeScript)

[플레이그라운드](https://hangulscript.vercel.app/) · [문서](https://hangulscript.vercel.app/docs/) · [문법 명세](LANGUAGE.md) · [VS Code 확장](extensions/vscode/README.md) · [npm](https://www.npmjs.com/package/@uiwwsw/hangulscript) · [변경 내역](CHANGELOG.md)

</div>

## 이게 뭔가요

한글 문장으로 코드를 쓰고, TypeScript와 같은 수준의 타입 검사를 받아 JavaScript로 실행하는 언어입니다. `.hgs` 파일을 TypeScript 코드로 바꾼 뒤 TypeScript 컴파일러로 검사하고 `.js`·`.d.ts`를 만듭니다.

## 장점

- **한글 문장으로 쓰되 타입 안전성은 TypeScript와 같습니다.** 검사를 TypeScript 컴파일러가 strict 모드로 하므로 타입 오류를 같은 기준으로 잡아냅니다.
- **기존 JavaScript 생태계와 바로 연결됩니다.** 결과물이 ES 모듈 `.js`와 `.d.ts`라서 npm 패키지를 그대로 쓰고, TypeScript 프로젝트에서 import할 수 있습니다. React·Vue 프로젝트에는 Vite 플러그인으로 붙습니다.
- **실제 개발 도구가 있습니다.** VS Code 확장이 문법 강조, 포맷, 오류 표시, 타입 정보, 정의 이동, 자동 완성을 제공합니다.
- **설치 없이 바로 써 볼 수 있습니다.** 온라인 플레이그라운드에서 코드를 실행하고 링크로 공유합니다.
- **한글 기본 함수 61개.** 목록·집합·사전·정렬·문자열·검증 등을 한글 이름으로 씁니다.

## 지금 되는 것

- `ksc run 파일.hgs`: Node.js에서 바로 실행
- `ksc build`: `.js`와 `.d.ts` 생성 (`--typescript`는 TypeScript 출력)
- `ksc --check`: 타입 검사
- Node 로더 `@uiwwsw/hangulscript/register`
- Vite 플러그인 `@uiwwsw/hangulscript/vite`: 구문·타입 오류 시 빌드 실패
- 한글 기본 함수 61개 (목록·집합·사전·복사·정렬·숫자·문자열·검증·화면)
- VS Code 확장: 문법 강조, 문서 포맷, 오류 표시, 타입 정보, 정의 이동, 스코프 자동 완성, 스니펫
- 온라인 플레이그라운드: 격리된 iframe과 Worker에서 최대 2초 실행, 공유 링크

## 아직 안 되는 것 / 진행 예정

- 독립 파서·타입 검사기·실행 엔진 (현재는 줄 단위 규칙 + TypeScript)
- 원본 `.hgs` 기준 소스맵
- LSP, 전체 속성 자동 완성, 자동 import, 이름 변경, 디버거, 브라우저용 VS Code
- 자연어 문장("3 더하기 5는?" 같은 표현) 해석. 설계 제안만 있음
- 탭 들여쓰기, 여러 줄 표현식
- 모든 JavaScript API의 한글 별칭, 데이터베이스·외부 API 연동
- `ksc run`의 격리와 시간 제한 (신뢰하는 코드에만 사용)
- 증분 빌드, watch, 진입 폴더 밖 의존성 빌드
- 1.0 호환성 약속. 0.x라 문법과 API가 바뀔 수 있음

## 설치

Node.js 20.19 이상이 필요합니다.

```bash
npm install --save-dev @uiwwsw/hangulscript
```

`hello.hgs`:

```text
이름은 "세상"이다

인사(누구: 문자열)를 정의한다:
    돌려주기 "안녕, " + 누구 + "!"

출력(인사(이름))
```

```bash
npx ksc run hello.hgs
```

## 문서

- [전체 README (문법, 함수, API, React·Vue, 성능, 공유, 릴리스)](https://github.com/uiwwsw/hangulscript/blob/main/docs/README-full.md)
- [공식 문서](https://hangulscript.vercel.app/docs/)
- [개발 로드맵](https://github.com/uiwwsw/hangulscript/blob/main/docs/ROADMAP.md)
- [문법 확장 설계 제안](https://github.com/uiwwsw/hangulscript/blob/main/docs/design/natural-language.md)
- [구성과 의존 프로젝트](https://github.com/uiwwsw/hangulscript/blob/main/docs/architecture.md)

## 라이선스

[MIT](https://github.com/uiwwsw/hangulscript/blob/main/LICENSE)
