declare const azFlag: unique symbol;

export type A_Z = string & { [azFlag]: never };

export const toAZ = (str: string): A_Z => {
  if (str.length !== 1) throw { message: `[${str}] is too long` };
  const charCode = str.toUpperCase().charCodeAt(0);
  if (charCode < 65 || charCode >= 91) throw { message: `[${str}] out of range` };
  return str as A_Z;
};

export const VK = {
  ESC: { v: '\x1b', label: 'Escape' },
  CR: { v: '\r', label: 'Return' },
  UP: { v: '\x1b[A', label: '↑' },
  DOWN: { v: '\x1b[B', label: '↓' },
  LEFT: { v: '\x1b[D', label: '←' },
  RIGHT: { v: '\x1b[C', label: '→' },
  HOME: { v: '\x1b[H', label: 'Home' },
  END: { v: '\x1b[F', label: 'End' },
  PGUP: { v: '\x1b[5~', label: 'PageUp' },
  PGDN: { v: '\x1b[6~', label: 'PageDn' },
  DEL: { v: '\x1b[3~', label: 'Delete' },
  BS: { v: '\x7f', label: 'Backspace' },
  CTRL: {
    v: (suffix: A_Z): string => String.fromCharCode(suffix.toUpperCase().charCodeAt(0) - 64),
    label: 'Ctrl',
  },
  META: {
    v: (suffix: A_Z): string => '\x1b' + suffix.toLowerCase(),
    label: 'Meta',
  },
} as const;

export type Vk = typeof VK[keyof typeof VK];

