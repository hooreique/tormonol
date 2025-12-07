declare const naturalNumberFlag: unique symbol;

export type NaturalNumber = number & { [naturalNumberFlag]: never };

export const isNaturalNumber = (num: number): num is NaturalNumber => Number.isSafeInteger(num) && num > 0;
