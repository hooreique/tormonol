export type Pty = {
  readonly write: (data: Uint8Array) => void;
  readonly onData: (consume: (data: Uint8Array) => void) => void;
  readonly close: () => void;
};
