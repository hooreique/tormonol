export const ttlSet = (opts?: {
  readonly ttl?: number;
  readonly afterAdd?: (str: string, set: ReadonlySet<string>) => void;
  readonly afterGone?: (str: string, set: ReadonlySet<string>) => void;
  readonly afterDelete?: (str: string, set: ReadonlySet<string>) => void;
  readonly afterHit?: (str: string, set: ReadonlySet<string>) => void;
  readonly afterMiss?: (str: string, set: ReadonlySet<string>) => void;
}): {
  readonly add: (str: string) => void;
  readonly has: (str: string) => boolean;
  readonly delete: (str: string) => void;
} => {
  const set = new Set<string>();

  return {
    add: (str: string): void => {
      set.add(str);
      (opts?.afterAdd ?? (() => undefined))(str, set);
      setTimeout(() => {
        if (set.delete(str)) (opts?.afterGone ?? (() => undefined))(str, set);
      }, opts?.ttl ?? 5_000);
    },
    has: (str: string): boolean => {
      const hit = set.has(str);
      (
        (hit ? opts?.afterHit : opts?.afterMiss)
        ??
        (() => undefined)
      )(str, set);
      return hit;
    },
    delete: (str: string) => {
      if (set.delete(str)) (opts?.afterDelete ?? (() => undefined))(str, set);
    },
  };
};
