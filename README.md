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

한글 문장으로 쓴 `.hgs` 파일을 줄 단위 규칙으로 TypeScript 코드로 바꾸는 변환기입니다. 표현식 처리, 타입 검사, `.js`·`.d.ts` 생성은 TypeScript 컴파일러가 합니다. 표현식은 JavaScript 문법 그대로입니다.

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

## 현재 위치

- npm 주간 다운로드 18회 (2026-11-18~11-24, api.npmjs.org).
- 실험 단계의 0.x 버전이고 관리자는 1명입니다.
- 저장소에서 확인되는 실사용 사례는 없습니다. 알려진 실사용 사례 없음.
- 한글 문장 문법은 TypeScript로 바꾸는 입력 방식 하나를 더하는 것입니다. 타입 검사, 에디터 지원, 라이브러리 생태계는 TypeScript가 이미 제공하므로 실무 프로젝트는 TypeScript를 직접 쓰는 편이 낫습니다.
- 팀 협업, 장기 유지보수, 프로덕션 서비스용으로는 권하지 않습니다.
- 용도: 한글 문장으로 코딩을 처음 접하는 입문 실습, 한글 문법 실험. 저장소에 입문 가이드와 온라인 플레이그라운드가 있습니다.

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
