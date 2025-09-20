import type { ComponentChild, ComponentChildren } from 'preact';
import { useSignal } from '@preact/signals';
import { Show } from '@preact/signals/utils';
import { ModalContext } from './modal.ts';


export const Layout = ({ children }: { children: ComponentChildren }) => {
  const modal = useSignal<ComponentChild>(undefined);

  return <div class="relative size-fit mx-auto">
    <ModalContext.Provider value={{
      set: child => {
        modal.value = child;
      },
      clear: () => {
        modal.value = undefined;
      },
    }}>
      <section class="size-fit">
        {children}
      </section>

      <Show when={modal}>
        <div class="absolute top-1/2 left-1/2 w-0 h-0">
          <dialog open class="-translate-x-1/2 -translate-y-1/2 size-fit rounded bg-[#424B5B] z-20">
            {modal}
          </dialog>
        </div>
      </Show>
    </ModalContext.Provider>
  </div>;
};
