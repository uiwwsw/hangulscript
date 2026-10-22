export const tools = {
  calculator: {
    title: '사칙연산 계산기',
    fields: [{key:'left',label:'첫 번째 수',value:'24',type:'number'},{key:'right',label:'두 번째 수',value:'6',type:'number'},{key:'operation',label:'연산',value:'나누기',options:['더하기','빼기','곱하기','나누기']}],
    source: v => `문장으로 시작
첫째는 ${v.left}이다
둘째는 ${v.right}이다
연산은 ${JSON.stringify(v.operation)}이다

계산(가, 나, 방식)를 정의한다:
    만약 방식 == "더하기" 이라면:
        돌려주기 가 + 나
    아니고 방식 == "빼기" 이라면:
        돌려주기 가 - 나
    아니고 방식 == "곱하기" 이라면:
        돌려주기 가 * 나
    아니면:
        만약 나 == 0 이라면:
            돌려주기 "0으로 나눌 수 없습니다"
        돌려주기 가 / 나

출력("계산 결과:", 계산(첫째, 둘째, 연산))`
  },
  discount: {
    title:'할인 계산기',
    fields:[{key:'price',label:'가격 (원)',value:'32000',type:'number'},{key:'rate',label:'할인율 (%)',value:'15',type:'number'}],
    source:v=>`문장으로 시작
가격은 ${v.price}이다
할인율은 ${v.rate}이다
만약 가격 < 0 || 할인율 < 0 || 할인율 > 100 이라면:
    출력("가격은 0 이상, 할인율은 0~100 사이로 입력하세요")
아니면:
    할인액은 반올림(가격 * 할인율 / 100)이다
    출력("할인액:", 할인액, "원")
    출력("결제 금액:", 가격 - 할인액, "원")`
  },
  statistics: {
    title:'숫자 통계',
    fields:[{key:'numbers',label:'쉼표로 구분한 숫자',value:'10, 20, 30, 40',type:'text'}],
    source:v=>`문장으로 시작
입력값은 ${JSON.stringify(v.numbers)}이다
목록은 []이다
각 항목을 나누기(입력값, ",")에서:
    추가(목록, 숫자로(항목))
출력("개수:", 길이(목록))
출력("합계:", 합계(목록))
출력("평균:", 평균(목록))
출력("최솟값:", 최솟값(목록))
출력("최댓값:", 최댓값(목록))`
  },
  text: {
    title:'문자열 정리기',
    fields:[{key:'text',label:'정리할 문장',value:'  사과, 바나나, 사과, 포도  ',type:'text'}],
    source:v=>`문장으로 시작
원문은 ${JSON.stringify(v.text)}이다
단어들은 []이다
각 조각을 나누기(다듬기(원문), ",")에서:
    단어는 다듬기(조각)이다
    만약 길이(단어) > 0 && !포함(단어들, 단어) 이라면:
        추가(단어들, 단어)
출력("중복 없이:", 잇기(단어들, " · "))
출력("단어 수:", 길이(단어들))`
  }
};
export function defaults(tool) { return Object.fromEntries(tool.fields.map(f => [f.key,f.value])); }
