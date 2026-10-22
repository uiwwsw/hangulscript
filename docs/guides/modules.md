# 모듈과 JavaScript로 배포하기

관련 있는 함수를 `.hgs` 파일에 묶고 공개합니다. 아래 첫 코드는 `math.hgs`입니다.

```hgs
더함(가: 숫자, 나: 숫자)를 정의한다:
    돌려주기 가 + 나
더함을 공개한다
```

진입 파일 `main.hgs`에서 상대 경로로 가져옵니다.

```hgs
"./math.hgs"에서 { 더함 }을 가져온다
출력(더함(2, 3))
```

```bash
npx ksc run main.hgs
node --import @uiwwsw/hangulscript/register main.hgs
npx ksc build main.hgs --out-dir dist
```

직접 실행은 소스 옆에 생성물을 남기지 않습니다. 빌드는 진입 폴더 아래 HGS 의존성도 함께 만들며 import 경로를 `.js`로 바꿉니다. `dist/main.js`, `dist/main.d.ts`, `dist/math.js`, `dist/math.d.ts`가 생성됩니다. 진입 폴더 밖 HGS 의존성은 오류로 처리하므로 공통 상위 폴더에 진입 파일을 두세요.

JavaScript와 TypeScript에서는 생성된 `.js`를 가져옵니다. TypeScript는 인접한 `.d.ts`를 읽습니다. 출력은 ESM이므로 소비 프로젝트에 `"type": "module"`을 설정합니다. 기존 JS 파일과 자산은 HGS 빌드가 복사하지 않습니다.

`ksc --check main.hgs`는 타입만 검사합니다. `ksc --typescript main.hgs`는 내부 변환 TypeScript를 확인하는 옵션이며 별도 소스 문법이 아닙니다. 원본 디버깅 소스맵·자동 빌드 감시 CLI·독립 네이티브 바이너리 출력은 아직 제공하지 않습니다.
