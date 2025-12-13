/**
 * 비동기 함수 줄세우기 유틸리티.
 * 경합이 예상되는 상황에 쓰입니다.
 *
 * @example ```typescript
 * const fooQueue: Mutex = mutex();
 *
 * handleConcurrentFoo(() => fooQueue(() => {
 *   // Do some foo stuff...
 * }));
 *
 * const barQueue: Mutex = mutex();
 *
 * handleConcurrentBar(() => barQueue(() => {
 *   // Do some bar stuff...
 * }));
 * ```
 */
export type Mutex = (fn: () => Promise<void>) => void;

/**
 * 새 Mutex Queue 를 만듭니다.
 * **이렇게 만들어진 각 Mutex Queue 들은 서로 독립적으로 행동합니다.**
 */
export const mutex = (): Mutex => {
  let m: Promise<void> = Promise.resolve();

  return (fn: () => Promise<void>) => {
    m = m.then(fn).catch(() => undefined);
  };
};
