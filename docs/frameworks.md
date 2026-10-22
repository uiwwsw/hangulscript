# React·Vue에서 한글스크립트 사용하기

이 가이드는 `@uiwwsw/hangulscript@0.8.0` 문법과 공통 Vite 플러그인을 사용합니다.
화면과 상태는 React/Vue로 만들고 계산·조건·검증 함수를 `.hgs`에 작성합니다.
데모의 `숫자입력`·`버튼`·`보여주기`는 데모 UI 실행 환경의 API이며 React/Vue 컴포넌트로 자동 변환되지 않습니다.

## 완성된 예제를 먼저 실행하기

Node.js 24에서 검증했습니다. 예제의 Vite는 Node.js `^20.19.0 || >=22.12.0`을 요구합니다.

```bash
git clone https://github.com/uiwwsw/hangulscript.git
cd hangulscript/examples/react-vite
npm ci
npm run dev
```

Vue는 같은 저장소의 `examples/vue-vite`에서 `npm ci`와 `npm run dev`를 실행하세요.
터미널에 표시된 localhost 주소를 열고 가격 10000, 할인율 20을 입력한 뒤 **계산하기**를 누르면 결제 금액 8,000원이 표시됩니다.
개발 서버는 loopback에서 실행하며, 포트가 사용 중이면 터미널에 표시된 실제 주소를 사용하세요.
배포할 정적 파일은 각 예제에서 `npm run build`로 만들고 `npm run preview`로 확인합니다.

- [React 전체 소스](../examples/react-vite)
- [Vue 전체 소스](../examples/vue-vite)

## 기존 Vite 프로젝트에 설치하기

```bash
npm install --save-dev @uiwwsw/hangulscript@^0.8.0
```

React/Vue와 해당 Vite 플러그인은 기존 프로젝트에 설치돼 있다고 가정합니다.
새 프로젝트는 위의 완성된 예제를 사용할 수 있습니다.

React의 `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import hangulscript from '@uiwwsw/hangulscript/vite';

export default defineConfig({ plugins: [hangulscript(), react()] });
```

Vue의 `vite.config.js`:

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import hangulscript from '@uiwwsw/hangulscript/vite';

export default defineConfig({ plugins: [hangulscript(), vue()] });
```

## 공통 로직 작성하기

두 예제의 `src/discount.hgs`는 동일합니다. 함수와 조건을 한글 문장으로 작성하고 ESM `export`로 내보냅니다.

```text
결제금액(가격: 숫자, 할인율: 숫자)를 정의한다:
    만약 !Number.isFinite(가격) || !Number.isFinite(할인율) || 가격 < 0 || 할인율 < 0 || 할인율 > 100 이라면:
        돌려주기 "가격은 0 이상, 할인율은 0~100 사이로 입력하세요"
    돌려주기 가격 - 반올림(가격 * 할인율 / 100)

결제금액을 공개한다
```

## React에서 호출하기

`src/main.jsx`에서 함수를 가져와 submit 이벤트에 연결합니다. 입력과 결과 상태는 React가 관리합니다.

```jsx
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 결제금액 } from './discount.hgs';
import './style.css';

function App() {
  const [가격, 가격변경] = useState('10000');
  const [할인율, 할인율변경] = useState('20');
  const [결과, 결과변경] = useState(null);
  function 계산(event) {
    event.preventDefault();
    결과변경(결제금액(Number(가격), Number(할인율)));
  }
  return <main>
    <h1>React + 한글스크립트</h1>
    <p>화면은 React, 계산과 검증은 discount.hgs에서 처리합니다.</p>
    <form onSubmit={계산}>
      <label>가격 (원)<input type="number" min="0" required value={가격} onChange={e => 가격변경(e.target.value)} /></label>
      <label>할인율 (%)<input type="number" min="0" max="100" step="any" required value={할인율} onChange={e => 할인율변경(e.target.value)} /></label>
      <button type="submit">계산하기</button>
    </form>
    <output aria-live="polite">{결과 === null ? '입력 후 계산하기를 눌러 주세요.' : typeof 결과 === 'number' ? `결제 금액: ${결과.toLocaleString('ko-KR')}원` : 결과}</output>
  </main>;
}
createRoot(document.getElementById('app')).render(<App />);
```

## Vue에서 호출하기

`src/App.vue`에서 같은 함수를 가져와 submit 이벤트에 연결합니다. 반응형 상태는 Vue가 관리합니다.

```vue
<script setup>
import { ref } from 'vue';
import { 결제금액 } from './discount.hgs';
const 가격 = ref(10000);
const 할인율 = ref(20);
const 결과 = ref(null);
function 계산() {
  결과.value = 결제금액(Number(가격.value), Number(할인율.value));
}
</script>

<template>
  <main>
    <h1>Vue + 한글스크립트</h1>
    <p>화면은 Vue, 계산과 검증은 discount.hgs에서 처리합니다.</p>
    <form @submit.prevent="계산">
      <label>가격 (원)<input v-model="가격" type="number" min="0" required /></label>
      <label>할인율 (%)<input v-model="할인율" type="number" min="0" max="100" step="any" required /></label>
      <button type="submit">계산하기</button>
    </form>
    <output aria-live="polite">{{ 결과 === null ? '입력 후 계산하기를 눌러 주세요.' : typeof 결과 === 'number' ? `결제 금액: ${결과.toLocaleString('ko-KR')}원` : 결과 }}</output>
  </main>
</template>
```

## TypeScript 프로젝트와 빌드 범위

| 방식 | 제공 범위 | 적합한 용도 |
| --- | --- | --- |
| Vite 플러그인으로 `.hgs` import | JavaScript 변환, Vite 개발 서버·빌드 연동 | React/Vue JavaScript 프로젝트 |
| `ksc build` 후 `.js` import | 타입 검사, JavaScript와 `.d.ts` 생성 | TypeScript 프로젝트·라이브러리 |
| 온라인 데모의 화면 함수 | 격리 실행, 입력창·버튼·결과 카드 | 설치 없는 도구 만들기·코드 공유 |

0.7.0부터 Vite 플러그인은 구문과 타입을 검사하고 오류가 있으면 빌드를 중단합니다. 선언 생성·디버깅용 원본 `.hgs` 소스맵은 제공하지 않습니다.
TypeScript에서 `.hgs` 파일을 직접 가져오면 모듈 타입을 찾지 못할 수 있습니다.
외부 TypeScript 소비자에게 선언을 제공하려면 다음처럼 빌드한 `.js`를 가져오세요. 인접한 `.d.ts`를 TypeScript가 읽습니다.

```bash
npx ksc build src/discount.hgs
```

```ts
import { 결제금액 } from './discount.js';
const 결과 = 결제금액(10000, 20); // number | string
```

이 방식은 `.hgs`를 수정할 때 다시 빌드해야 합니다. 명시적인 타입과 추론 가능한 값은 검사하며, `any` 값에 대한 검사는 제한됩니다.
Next.js·Webpack처럼 Vite를 사용하지 않는 환경에서도 미리 만든 `.js`·`.d.ts`를 가져오는 방식을 사용할 수 있습니다. 전용 Next.js·Webpack 플러그인은 제공하지 않습니다.
