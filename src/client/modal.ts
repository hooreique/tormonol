import type { ComponentChild } from 'preact';
import { createContext } from 'preact';


export const ModalContext = createContext<{
  readonly set: (child: ComponentChild) => void;
  readonly clear: () => void;
}>(undefined);
