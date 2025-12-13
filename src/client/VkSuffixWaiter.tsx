import { useEffect, useRef } from 'preact/hooks';


export const VkSuffixWaiter = ({ prefix, resolve, reject }: {
  readonly prefix: string;
  readonly resolve: (str: string) => void;
  readonly reject: (reason?: any) => void;
}) => {
  const el = useRef<HTMLInputElement>();

  useEffect(() => {
    el.current.focus();

    const onInput = ({ data }: InputEvent) => {
      if (data) resolve(data);
      else reject({ message: '[VkSuffixWaiter] input data is empty' });
    };

    el.current.addEventListener('input', onInput);

    const onBlur = () => reject({ message: '[VkSuffixWaiter] cancelled' });

    el.current.addEventListener('blur', onBlur);

    return () => {
      el.current.removeEventListener('blur', onBlur);
      el.current.removeEventListener('input', onInput);
      reject({ message: '[VkSuffixWaiter] unmounted' });
    };
  });

  return <div class="p-4">
    <div class="w-xs text-center">
      {prefix} + <input
        ref={el} type="text" maxLength={1} pattern="[a-zA-Z]" autoComplete="off"
        placeholder="Listening…" size={10}
        class="focus:outline-none"
      />
    </div>
  </div>;
};

