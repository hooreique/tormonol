import type { ComponentChildren } from 'preact';
import { createContext } from 'preact';
import { useEffect, useState } from 'preact/hooks';


/**
 * 현재 뷰포트의 너비가 큰지 작은지 알려주는 Context
 */
export const ViewportWidthContext = createContext<{
  /**
   * 뷰포트의 너비가 960px 미만이면 `true`, 그렇지 않으면 `false`
   */
  readonly isSmall: boolean;
}>({ isSmall: false });

export const ViewportWidthContextProvider = ({ children }: { children: ComponentChildren }) => {
  const mql: MediaQueryList = matchMedia("(width < 960px)");

  const [isSmall, setIsSmall] = useState<boolean>(mql.matches);

  useEffect(() => {
    const listener = (ev: MediaQueryListEvent): void => setIsSmall(ev.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  });

  return <ViewportWidthContext.Provider value={{ isSmall }}>
    {children}
  </ViewportWidthContext.Provider>;
};
