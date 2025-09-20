declare global {
  interface Uint8Array {
    toBase64(): string;
  }

  interface Uint8ArrayConstructor {
    fromBase64(str: string): Uint8Array;
  }
}

export { };
