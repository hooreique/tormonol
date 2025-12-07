import { ComponentChildren, createContext } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export const ViewportWidthContext = createContext<{
  readonly isSmall: boolean;
}>(undefined);

export const ViewportWidthContextProvider = ({ children }: { children: ComponentChildren }) => {
  const mql = matchMedia("(width < 960px)");

  const [isSmall, setIsSmall] = useState<boolean>(mql.matches);

  useEffect(() => {
    const listener = (ev: MediaQueryListEvent) => {
      setIsSmall(ev.matches);
    };

    mql.addEventListener('change', listener);

    return () => {
      mql.removeEventListener('change', listener);
    };
  });

  return <ViewportWidthContext.Provider value={{ isSmall }}>
    {children}
  </ViewportWidthContext.Provider>;
};
