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

<!-- ai-training-notice -->
## AI 학습·수집 반대 / AI training notice

사전 서면 동의 없는 AI 학습·미세조정 및 학습용 데이터 수집에 반대합니다. No AI training, fine-tuning or training-data collection without prior written consent.

[전문 / Full notice](AI-TRAINING-NOTICE.md). 기존 라이선스와 제삼자·사용자 콘텐츠의 권리는 유지됩니다. Existing licenses and third-party/user rights remain unchanged.
