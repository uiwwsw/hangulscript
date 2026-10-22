import { collectionsRuntime } from './collections.js';
import { uiRuntime } from './ui.js';
export const sentenceRuntime = `${uiRuntime}

function 출력(...값: unknown[]): void { console.log(...값); }
function 길이(값: string | readonly unknown[] | ReadonlySet<unknown> | ReadonlyMap<unknown, unknown>): number { return "size" in Object(값) ? (값 as ReadonlySet<unknown>).size : (값 as string | readonly unknown[]).length; }
function 추가<T>(목록: T[], 값: T): void { 목록.push(값); }
function 포함<T>(목록: readonly T[] | ReadonlySet<T>, 값: T): boolean { return 목록 instanceof Set ? 목록.has(값) : (목록 as readonly T[]).includes(값); }
function 나누기(글: string, 구분: string): string[] { return 글.split(구분); }
function 잇기(목록: readonly unknown[], 구분 = ""): string { return 목록.join(구분); }
function 합계(값: readonly number[]): number { return 값.reduce((합, 항목) => 합 + 항목, 0); }
function 숫자로(값: string | number): number {
  if (typeof 값 === "string" && 값.trim() === "") throw new Error("빈 문자열은 숫자로 바꿀 수 없습니다.");
  const 결과 = Number(값);
  if (!Number.isFinite(결과)) throw new Error("유한한 숫자를 입력하세요.");
  return 결과;
}
function 다듬기(글: string): string { return 글.trim(); }
function 반올림(값: number, 자리 = 0): number {
  if (!Number.isFinite(값) || !Number.isInteger(자리) || 자리 < -10 || 자리 > 10) throw new Error("유한한 수와 -10~10 사이의 정수 자리가 필요합니다.");
  return Math.round(값 * 10 ** 자리) / 10 ** 자리;
}
function 평균(목록: readonly number[]): number {
  if (!목록.length) throw new Error("빈 목록의 평균을 구할 수 없습니다.");
  return 합계(목록) / 목록.length;
}
function 최솟값(목록: readonly number[]): number {
  if (!목록.length) throw new Error("빈 목록의 최솟값을 구할 수 없습니다.");
  let 결과 = 목록[0]; for (const 항목 of 목록) if (항목 < 결과) 결과 = 항목;
  return 결과;
}
function 최댓값(목록: readonly number[]): number {
  if (!목록.length) throw new Error("빈 목록의 최댓값을 구할 수 없습니다.");
  let 결과 = 목록[0]; for (const 항목 of 목록) if (항목 > 결과) 결과 = 항목;
  return 결과;
}
function 정렬비교(가: number | string, 나: number | string): number {
  if (typeof 가 !== typeof 나) throw new Error("같은 종류의 숫자 또는 문자열을 정렬하세요.");
  if (typeof 가 === "number" && typeof 나 === "number") { if (!Number.isFinite(가) || !Number.isFinite(나)) throw new Error("정렬할 숫자는 유한해야 합니다."); return 가 - 나; }
  return (가 as string).localeCompare(나 as string, "ko", { numeric: true });
}
function 정렬<T extends number | string>(값: readonly T[]): T[];
function 정렬<T>(값: readonly T[], 비교: (가: T, 나: T) => number): T[];
function 정렬<T>(값: readonly T[], 비교?: (가: T, 나: T) => number): T[] {
  if (!비교 && 값.some(항목 => !["number", "string"].includes(typeof 항목) || typeof 항목 === "number" && !Number.isFinite(항목))) throw new Error("정렬할 값은 유한한 숫자 또는 문자열이어야 합니다.");
  return [...값].sort(비교 ?? ((가, 나) => 정렬비교(가 as number | string, 나 as number | string)));
}
function 범위(시작: number, 끝?: number, 간격 = 1): number[] {
  if (끝 === undefined) { 끝 = 시작; 시작 = 0; }
  if (!Number.isFinite(시작) || !Number.isFinite(끝) || !Number.isFinite(간격) || 간격 === 0) throw new Error("범위에는 유한한 수와 0이 아닌 간격이 필요합니다.");
  const 개수 = Math.max(0, Math.ceil((끝 - 시작) / 간격));
  if (개수 > 100000) throw new Error("범위는 최대 100000개까지 만들 수 있습니다.");
  return Array.from({ length: 개수 }, (_, 순서) => 시작 + 순서 * 간격);
}
${collectionsRuntime}
`;
