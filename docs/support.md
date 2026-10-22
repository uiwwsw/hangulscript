# 지원 범위와 호환성

한글스크립트는 명시된 한국어 문법을 JavaScript ES 모듈로 컴파일합니다. 임의의 자연어를 추측하지 않으며 별도 시작 표기는 사용하지 않습니다. 이 문서는 0.7.0 언어 패키지와 0.2.0 VS Code 확장의 지원 계약입니다.

| 환경 | 지원 내용 | 검증 |
| --- | --- | --- |
| Node.js 20.19 이상 | `ksc run`, JS + `.d.ts` 빌드, `.hgs` 모듈 import | Node 22·24 CI, 실행 통합 테스트 |
| React·Vue + Vite | `.hgs` import, 개발·프로덕션 타입 오류 차단 | React JSX·Vue SFC 예제 빌드 |
| VS Code 데스크톱 1.90 이상 | 문법 강조, 들여쓰기, 포맷, 진단, 타입 정보, 정의로 이동, 스코프 자동 완성 | 실제 Extension Host 통합 테스트 |
| 웹 데모 | 타입 검사, 격리 실행, 입력·버튼 UI, 공유 | 별도 브라우저 검사기 테스트 |
| JavaScript·TypeScript 소비자 | 생성된 `.js`와 `.d.ts` import | ESM 실행·선언 생성 테스트 |

## Node에서 사용하기

```bash
npm install @uiwwsw/hangulscript@^0.7.0
npx ksc run src/main.hgs
# 또는 Node의 등록 진입점으로 직접 로드
node --import @uiwwsw/hangulscript/register src/main.hgs
# 배포 파일 생성
npx ksc build src/main.hgs --out-dir dist
```

`ksc run`과 Node 등록 진입점은 `.hgs` 상대 import를 직접 읽고 검사합니다. 소스 옆에 생성물을 남기지 않습니다. 일반 Node 코드와 마찬가지로 파일·네트워크 권한을 가지므로 신뢰하는 코드에 사용하세요.

`ksc build`는 진입 파일과 그 폴더 아래의 `.hgs` 의존성을 함께 빌드하고 디렉터리 구조를 유지합니다. `.hgs` import는 `.js`로 바뀝니다. 진입 폴더 밖의 HGS 의존성은 오류로 처리하므로 공통 상위 폴더에 진입 파일을 두세요. 생성된 `.js`는 ESM이므로 소비 프로젝트 `package.json`에 `"type": "module"`을 설정하세요.

Vite가 아닌 환경에서 `.hgs` 파일을 바로 가져오려면 해당 로더가 필요합니다. 미리 생성한 `.js`·`.d.ts`는 일반 JS/TS 모듈로 사용할 수 있습니다. 상대 경로의 기존 JavaScript 파일·정적 자산은 HGS 빌드가 복사하지 않습니다.

## 타입과 오류

기본 검사는 strict 모드입니다. 가장 가까운 `tsconfig.json`의 `compilerOptions`와 `extends`를 읽습니다. 타입 해석을 위한 `types`, `typeRoots`, `paths`, `lib` 등을 사용할 수 있습니다. Node API 타입이 필요하면 프로젝트에 `@types/node`를 설치하고 `compilerOptions.types`에 `"node"`를 추가하세요. 파일 선택은 HGS 진입 파일과 import 그래프로 결정됩니다. 출력 형식은 ESM/ES2022, JS + 선언으로 고정하며 `noEmit`, `outDir` 등 출력 옵션은 CLI 설정이 우선합니다.

함수 매개변수에 타입을 적으면 잘못된 인자 타입·개수·존재하지 않는 속성을 검사합니다. `any`를 지정한 값은 엄격한 검사를 우회합니다. 외부 JavaScript 모듈은 대응하는 타입 선언이 있어야 정확히 검사됩니다. 브라우저 데모는 로컬 tsconfig·Node API·외부 모듈을 읽지 않습니다.

진단은 원본 HGS 행과 UTF-16 열을 사용합니다. 변환 과정에서 새로 생긴 토큰의 정확한 열을 찾을 수 없으면 해당 문장의 시작 위치를 사용합니다. 디버거용 소스맵과 실행 중 스택 추적의 원본 위치 변환은 아직 제공하지 않습니다.

## 편집기 기능과 배포

[VS Code 설치 및 기능 안내](../extensions/vscode/README.md)를 참고하세요. 확장은 컴파일러와 같은 저장소에서 관리하며 독립 버전으로 배포합니다. 편집기 검사는 Worker에서 실행하며 사용자 코드는 실행하지 않습니다. 자동 완성은 스코프의 이름과 스니펫을 제공합니다. 전체 속성 자동 완성, 자동 import, 이름 변경, 디버거, vscode.dev는 아직 지원하지 않습니다.

0.x에서는 문법의 호환성을 깨는 변경을 minor 버전에서만 진행하고 변경 내역·마이그레이션을 안내합니다. patch 버전은 호환되는 수정에 사용합니다. 1.0은 별도의 문법 동결과 호환성 검증을 거쳐 결정합니다. 사용자용 확장을 Marketplace에 게시하는 것과 Microsoft가 기본 내장 언어로 채택하는 것은 별개입니다.
