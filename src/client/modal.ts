import type { ComponentChild } from 'preact';
import { createContext } from 'preact';


/**
 * 모달 UI 인터페이스
 */
export const ModalContext = createContext<{
  /**
   * 모달을 띄웁니다.
   * @param child 띄울 모달
   */
  readonly set: (child: ComponentChild) => void;

  /**
   * 모달을 내립니다.
   */
  readonly clear: () => void;
}>(undefined);
