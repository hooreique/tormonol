/**
 * 터미널 백엔드 (Pseudoterminal) 인터페이스
 */
export type Pty = {
  /**
   * Pty 에 Data 를 보냅니다.
   * @param data 보낼 Data
   */
  readonly write: (data: Uint8Array) => void;

  /**
   * Pty 로부터 온 Data 를 처리할 함수를 등록합니다.
   * @param consume Pty 로부터 온 Data 를 처리할 함수
   */
  readonly onData: (consume: (data: Uint8Array) => void) => void;

  /**
   * Pty 와의 통신을 종료합니다.
   */
  readonly close: () => void;
};
