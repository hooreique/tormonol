import { createContext } from "preact";


export const Input = createContext<(str: string) => void>(undefined);
