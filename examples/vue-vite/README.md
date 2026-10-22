# 한글스크립트 + Vue 할인 계산기

실제 npm 패키지 `@uiwwsw/hangulscript@0.6.0`을 사용합니다.
Node.js 20.19 이상(20.x), 또는 22.12 이상이 필요합니다. Node.js 24에서 검증했습니다.

```bash
npm ci
npm run dev
```

터미널에 표시된 localhost 주소를 여세요. 가격 10000과 할인율 20을 입력한 뒤 계산하기를 누르면 8000원이 나옵니다.
포트가 사용 중이면 Vite가 선택한 실제 주소를 사용하세요.

```bash
npm run build
npm run preview
```

화면은 Vue로 작성하고 계산과 입력 검사는 `src/discount.hgs`에서 수행합니다.
`vite.config.js`의 공통 플러그인이 `.hgs`를 빌드할 때 JavaScript로 변환합니다.
[전체 사용 안내](../../docs/frameworks.md)를 참고하세요.
