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
