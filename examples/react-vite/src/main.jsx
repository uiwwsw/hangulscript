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
