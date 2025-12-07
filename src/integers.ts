declare const integerFlag: unique symbol;

export type Integer = number & { [integerFlag]: never };

export const isInteger = (num: number): num is Integer => Number.isSafeInteger(num);
