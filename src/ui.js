// A data-only UI protocol: the host renders descriptors, never user HTML or code.
export function createUIBridge(values = {}, action = '') {
  const elements = [];
  const labels = new Set();
  const text = value => String(value).slice(0, 2000);
  function add(type, label, extra = {}) {
    label = text(label);
    if (!label || labels.has(label)) throw new Error('화면 요소의 이름은 비어 있거나 중복될 수 없습니다.');
    if (elements.length >= 40) throw new Error('화면에는 최대 40개 요소를 만들 수 있습니다.');
    labels.add(label);
    const item = { type, label, ...extra };
    elements.push(item);
    return item;
  }
  return {
    number(label, initial = 0) {
      const raw = Object.hasOwn(values, label) ? values[label] : initial;
      if (String(raw).trim() === '' || !Number.isFinite(Number(raw))) throw new Error(`${text(label)}: 올바른 숫자를 입력하세요.`);
      const value = Number(raw); add('number', label, { value }); return value;
    },
    text(label, initial = '') {
      const value = text(Object.hasOwn(values, label) ? values[label] : initial);
      add('text', label, { value }); return value;
    },
    select(label, options, initial = options?.[0]) {
      if (!Array.isArray(options) || !options.length || options.length > 30) throw new Error('선택 항목은 1~30개가 필요합니다.');
      options = options.map(text);
      const value = text(Object.hasOwn(values, label) ? values[label] : initial);
      if (!options.includes(value)) throw new Error(`${text(label)}: 목록에서 항목을 선택하세요.`);
      add('select', label, { value, options }); return value;
    },
    button(label) { add('button', label); return action === label; },
    show(label, value) { add('result', label, { value: text(value) }); },
    snapshot() { return elements; }
  };
}

export const uiRuntime = `
function 화면연결(): { number: (이름: string, 기본값?: number) => number; text: (이름: string, 기본값?: string) => string; select: (이름: string, 항목: string[], 기본값?: string) => string; button: (이름: string) => boolean; show: (이름: string, 값: unknown) => void } {
  const 연결 = (globalThis as any).__hangulUI;
  if (!연결) throw new Error("화면 함수는 한글스크립트 UI 실행 환경에서 사용하세요.");
  return 연결;
}
function 숫자입력(이름: string, 기본값 = 0): number { return 화면연결().number(이름, 기본값); }
function 글자입력(이름: string, 기본값 = ""): string { return 화면연결().text(이름, 기본값); }
function 선택입력(이름: string, 항목: string[], 기본값 = 항목[0]): string { return 화면연결().select(이름, 항목, 기본값); }
function 버튼(이름: string): boolean { return 화면연결().button(이름); }
function 보여주기(이름: string, 값: unknown): void { 화면연결().show(이름, 값); }
`;
