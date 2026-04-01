export type strOrNum = string | number

export type priorityType = -1 | 1 | 2 | 3 | 4

export type scientificArr = ["sin", "cos", "tan", "log", "ln", "sqrt"]

export type scientificOp = scientificArr[number]

export type Operator = "+" | "-" | "/" | "*" | "%" | "^" | "!" | "minus" | "(" | ")"

export interface IStack {
    resiprocal(str: string): number | null,
    tokenGenerator(str: string): strOrNum[]
    postfix(arr: strOrNum[]): strOrNum[]
    evaluatePostfix(arr: strOrNum[]): number
    toggleSign(arr: strOrNum[]): strOrNum[] | string
}

export interface IHistory {
    appendHistory(exp: string, val: number): void 
    loadLocal(): void 
}
