export const collectionsRuntime = `
function 목록으로<T>(값: Iterable<T>): T[] { return Array.from(값); }
function 첫번째<T>(값: readonly T[]): T | undefined { return 값[0]; }
function 마지막<T>(값: readonly T[]): T | undefined { return 값.at(-1); }
function 꺼내기<T>(값: readonly T[], 순서: number): T | undefined { return 값.at(순서); }
function 각각바꾸기<T, U>(값: readonly T[], 바꿀: (항목: T, 순서: number) => U): U[] { return 값.map(바꿀); }
function 골라내기<T>(값: readonly T[], 조건: (항목: T, 순서: number) => boolean): T[] { return 값.filter(조건); }
function 찾기<T>(값: readonly T[], 조건: (항목: T, 순서: number) => boolean): T | undefined { return 값.find(조건); }
function 순서찾기<T>(값: readonly T[], 조건: (항목: T, 순서: number) => boolean): number { return 값.findIndex(조건); }
function 모두만족<T>(값: readonly T[], 조건: (항목: T) => boolean): boolean { return 값.every(조건); }
function 하나라도만족<T>(값: readonly T[], 조건: (항목: T) => boolean): boolean { return 값.some(조건); }
function 누적하기<T, U>(값: readonly T[], 시작: U, 합칠: (누적: U, 항목: T, 순서: number) => U): U { return 값.reduce(합칠, 시작); }
function 잘라내기<T>(값: readonly T[], 시작: number, 끝?: number): T[] { return 값.slice(시작, 끝); }
function 이어붙이기<T>(...목록들: readonly (readonly T[])[]): T[] { return 목록들.flatMap(값 => [...값]); }
function 뒤집기<T>(값: readonly T[]): T[] { return [...값].reverse(); }
function 펼치기<T>(값: readonly (readonly T[])[]): T[] { return 값.flatMap(항목 => [...항목]); }
function 나눠묶기<T>(값: readonly T[], 크기: number): T[][] {
  if (!Number.isSafeInteger(크기) || 크기 < 1) throw new Error("묶음 크기는 1 이상의 안전한 정수여야 합니다.");
  const 결과: T[][] = []; for (let 순서 = 0; 순서 < 값.length; 순서 += 크기) 결과.push(값.slice(순서, 순서 + 크기)); return 결과;
}
function 짝짓기<T, U>(가: readonly T[], 나: readonly U[]): [T, U][] { return 가.slice(0, 나.length).map((값, 순서) => [값, 나[순서]]); }
function 중복제거<T>(값: Iterable<T>): T[] { return [...new Set(값)]; }
function 집합<T>(값: Iterable<T> = []): Set<T> { return new Set(값); }
function 집합에추가<T>(값: Set<T>, 항목: T): Set<T> { return 값.add(항목); }
function 집합에서삭제<T>(값: Set<T>, 항목: T): boolean { return 값.delete(항목); }
function 합집합<T>(가: ReadonlySet<T>, 나: ReadonlySet<T>): Set<T> { const 결과 = new Set(가); for (const 값 of 나) 결과.add(값); return 결과; }
function 교집합<T>(가: ReadonlySet<T>, 나: ReadonlySet<T>): Set<T> { const 결과 = new Set<T>(); for (const 값 of 가) if (나.has(값)) 결과.add(값); return 결과; }
function 차집합<T>(가: ReadonlySet<T>, 나: ReadonlySet<T>): Set<T> { const 결과 = new Set<T>(); for (const 값 of 가) if (!나.has(값)) 결과.add(값); return 결과; }
function 대칭차집합<T>(가: ReadonlySet<T>, 나: ReadonlySet<T>): Set<T> { const 결과 = new Set(가); for (const 값 of 나) { if (가.has(값)) 결과.delete(값); else 결과.add(값); } return 결과; }
function 부분집합인가<T>(가: ReadonlySet<T>, 나: ReadonlySet<T>): boolean { for (const 값 of 가) if (!나.has(값)) return false; return true; }
function 사전<K, V>(항목: Iterable<readonly [K, V]> = []): Map<K, V> { return new Map(항목); }
function 사전에담기<K, V>(대상: Map<K, V>, 키: K, 값: V): Map<K, V> { 대상.set(키, 값); return 대상; }
function 사전에서읽기<K, V>(대상: ReadonlyMap<K, V>, 키: K): V | undefined { return 대상.get(키); }
function 사전에있는가<K, V>(대상: ReadonlyMap<K, V>, 키: K): boolean { return 대상.has(키); }
function 사전에서삭제<K, V>(대상: Map<K, V>, 키: K): boolean { return 대상.delete(키); }
function 키목록<K, V>(대상: ReadonlyMap<K, V>): K[] { return [...대상.keys()]; }
function 값목록<K, V>(대상: ReadonlyMap<K, V>): V[] { return [...대상.values()]; }
function 항목목록<K, V>(대상: ReadonlyMap<K, V>): [K, V][] { return [...대상.entries()]; }
function 기준으로묶기<T, K>(값: readonly T[], 기준: (항목: T) => K): Map<K, T[]> {
  const 결과 = new Map<K, T[]>(); for (const 항목 of 값) { const 키 = 기준(항목); const 묶음 = 결과.get(키); if (묶음) 묶음.push(항목); else 결과.set(키, [항목]); } return 결과;
}
function 얕게복사<T extends object>(값: T): T {
  if (Array.isArray(값)) return [...값] as T;
  if (값 instanceof Map) return new Map(값) as T;
  if (값 instanceof Set) return new Set(값) as T;
  if (Object.getPrototypeOf(값) === Object.prototype || Object.getPrototypeOf(값) === null) return Object.assign(Object.create(Object.getPrototypeOf(값)), 값) as T;
  throw new Error("얕게복사는 목록·집합·사전·일반 객체에 사용하세요.");
}
function 깊게복사<T>(값: T): T { return structuredClone(값); }
function 오름차순<T extends number | string>(값: readonly T[]): T[] { return 정렬(값); }
function 내림차순<T extends number | string>(값: readonly T[]): T[] { for (const 항목 of 값) 정렬비교(항목, 항목); return 정렬(값, (가, 나) => -정렬비교(가, 나)); }
function 기준정렬<T>(값: readonly T[], 기준: (항목: T) => number | string, 방향: "오름차순" | "내림차순" = "오름차순"): T[] {
  if (방향 !== "오름차순" && 방향 !== "내림차순") throw new Error("정렬 방향은 오름차순 또는 내림차순이어야 합니다.");
  return 값.map(항목 => (() => { const 키 = 기준(항목); 정렬비교(키, 키); return { 항목, 키 }; })()).sort((가, 나) => 정렬비교(가.키, 나.키) * (방향 === "오름차순" ? 1 : -1)).map(항목 => 항목.항목);
}
function 확인한다(조건: unknown, 설명 = "확인 조건을 만족하지 못했습니다."): asserts 조건 { if (!조건) throw new Error(설명); }
`;
