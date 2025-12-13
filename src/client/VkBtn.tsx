import { useContext } from 'preact/hooks';

import type { Vk } from './virtual-kbd.ts';
import { toAZ } from './virtual-kbd.ts';
import { Input } from './vk-handling-context.ts';
import { VkSuffixWaiter } from './VkSuffixWaiter.tsx';
import { ModalContext } from './modal.ts';


export const VkBtn = ({ vk }: { readonly vk: Vk }) => {
  const modal = useContext(ModalContext);

  const input = useContext(Input);

  return <button
    onClick={() => {
      if (typeof vk.v === 'string') {
        input(vk.v);
        return;
      }

      new Promise((resolve, reject) => modal.set(<VkSuffixWaiter
        prefix={vk.label} resolve={resolve} reject={reject}
      />))
        .then(toAZ)
        .then(vk.v)
        .then(input)
        .catch(console.debug)
        .finally(modal.clear);
    }}
    class="inline-block min-w-[2em] px-2 py-1 rounded border border-gray-500 cursor-pointer hover:border-gray-400"
  >
    <kbd>{vk.label}</kbd>{typeof vk.v === 'function' ? " + …" : ""}
  </button>;
};
