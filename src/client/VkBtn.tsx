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

      new Promise(resolve => modal.set(<VkSuffixWaiter prefix={vk.label} resolve={resolve} />))
        .then(toAZ)
        .then(vk.v)
        .then(input)
        .catch(reason => alert(reason?.message ?? 'something went wrong'))
        .finally(modal.clear);
    }}
    class="inline-block px-3 py-1 rounded border border-gray-500"
  >
    <kbd>{vk.label}</kbd>{typeof vk.v === 'function' ? " + …" : ""}
  </button>;
};
