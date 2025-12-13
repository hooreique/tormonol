import { useEffect } from 'preact/hooks';


export const VkSuffixWaiter = ({ prefix, resolve }: {
  readonly prefix: string;
  readonly resolve: (str: string) => void;
}) => {
  useEffect(() => {
    setTimeout(() => {
      resolve('p');
    }, 1_000);
  });

  return <div>
    {prefix} + [waiting...]
  </div>;
};

