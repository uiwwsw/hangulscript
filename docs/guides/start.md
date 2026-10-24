# 첫 프로그램 만들기

한글스크립트는 `.hgs` 파일에 문장형 코드와 들여쓰기를 작성합니다. 시작 표기는 필요하지 않습니다. Node.js 20.19 이상을 설치하고 아래 순서대로 실행하세요.

```bash
npm install --save-dev @uiwwsw/hangulscript@^0.8.0
npx ksc run main.hgs
```

`main.hgs`에 다음을 저장합니다.

```hgs
점수들은 [75, 92, 88]이다
각 점수를 점수들에서:
    만약 점수 >= 80 이라면:
        출력(점수)
출력("평균:", 평균(점수들))
```

배포에는 `npx ksc build main.hgs --out-dir dist`를 사용합니다. JavaScript와 타입 선언 `.d.ts`가 함께 생성됩니다. 생성된 `.js`를 Node에서 실행할 프로젝트에는 package.json의 `"type": "module"`을 설정하세요.

설치 없이 확인하려면 [실행 화면](/playground/)을 사용하세요. 공유한 코드는 자동 실행하지 않습니다. 브라우저는 격리된 실행 환경에서 최대 2초 동안 동작합니다.


## 한글 코딩 기초

[온라인 입문](online.md) · [변수](variables.md) · [조건문](conditions.md) · [반복문](loops.md) · [함수](functions.md)
