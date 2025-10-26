import type { ComponentChild, ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';

import { ModalContext } from './modal.ts';


export const Layout = ({ children }: { children: ComponentChildren }) => {
  const [modal, setModal] = useState<ComponentChild | false>(false);

  return <div class="relative size-fit mx-auto">
    <ModalContext.Provider value={{
      set: child => {
        setModal(child);
      },
      clear: () => {
        setModal(false);
      },
    }}>
      <section class="size-fit">
        {children}
      </section>

      {
        modal
          ?
          <div class="absolute top-1/2 left-1/2 w-0 h-0">
            <dialog open class="-translate-x-1/2 -translate-y-1/2 size-fit rounded bg-[#424B5B] z-20">
              {modal}
            </dialog>
          </div>
          :
          undefined
      }
    </ModalContext.Provider>
  </div>;
};
