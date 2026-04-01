import {
  IStack,
  scientificOp,
  strOrNum,
  scientificArr
} from './types.js';

import {
  SCIENTIFIC_FUNCTIONS,
  SIGN_TRIGGER_OPS,
  applyBinaryOp,
  applyScientific,
  factorial,
  getPriority,
  isDigitOrDot,
  isLowerCaseLetter,
  isRightAssociative,
  precedesImplicitMultiply
} from './utils.js'
class Stack implements IStack {
  private operatorStack: strOrNum[] = [];
 
  readonly scientificArr: scientificArr = SCIENTIFIC_FUNCTIONS;

  resiprocal(str: string): number | null {
    const res = this.evaluatePostfix(this.postfix(this.tokenGenerator(str)));
    return res === 0 ? null : 1 / res;
  }

  tokenGenerator(str: string): strOrNum[] {
    const tokens: strOrNum[] = [];
    let idx = 0;
    let openCount = 0;
    let closeCount = 0;
 
    while (idx < str.length) {
      let c = str[idx]
      let ch = ""
      if(c) ch = c
      if (
        (ch === '+' || ch === '-') &&
        (idx === 0 || tokens[tokens.length - 1] === '(' || SIGN_TRIGGER_OPS.has(tokens[tokens.length - 1] as string)) &&
        tokens[tokens.length - 1] !== '!'
      ) {
        idx = this.consumeSignedNumber(str, idx, tokens);
        continue;
      }
 
      if (isDigitOrDot(ch)) {
        idx = this.consumeUnsignedNumber(str, idx, tokens);
        continue;
      }
 
      if (isLowerCaseLetter(ch)) {
        const [word, nextIdx] = this.readWord(str, idx);
        idx = nextIdx;
        if (this.scientificArr.includes(word as scientificOp)) {
          idx = this.consumeScientificCall(str, idx, word, tokens);
        }
        continue;
      }
 
      // ── Constants ──────────────────────────────────────────────────────────
      if (ch === 'π') {
        if (precedesImplicitMultiply(tokens)) tokens.push('*');
        tokens.push(Math.PI);
        idx++;
        continue;
      }
 
      if (ch === 'ℯ') {
        if (precedesImplicitMultiply(tokens)) tokens.push('*');
        tokens.push(Math.E);
        idx++;
        continue;
      }
 
      // ── Brackets & remaining operators ────────────────────────────────────
      if (ch === '(') {
        if (precedesImplicitMultiply(tokens)) tokens.push('*');
        openCount++;
        tokens.push(ch);
        idx++;
        continue;
      }
 
      if (ch === ')') {
        closeCount++;
        tokens.push(ch);
        idx++;
        continue;
      }
 
      tokens.push(ch);
      idx++;
    }
    
    if (openCount !== closeCount) throw new Error('Invalid parentheses');
    return tokens;
  }
 
  postfix(arr: strOrNum[]): strOrNum[] {
    const output: strOrNum[] = [];
    this.operatorStack = [];
 
    for (const token of arr) {
      if (typeof token === 'number') {
        output.push(token);
        continue;
      }
 
      if (token === '(') {
        this.operatorStack.push(token);
        continue;
      }
 
      if (token === ')') {
        while (this.operatorStack.length > 0 && this.stackTop() !== '(') {
          output.push(this.operatorStack.pop()!);
        }
        this.operatorStack.pop(); 
        continue;
      }
 
      while (
        this.operatorStack.length > 0 &&
        this.stackTop() !== '(' &&
        (getPriority(token) < getPriority(this.stackTop() as string) ||
          (getPriority(token) === getPriority(this.stackTop() as string) &&
            !isRightAssociative(token)))
      ) {
        output.push(this.operatorStack.pop()!);
      }
      this.operatorStack.push(token);
    }
 
    while (this.operatorStack.length > 0) {
      output.push(this.operatorStack.pop()!);
    }
 
    return output;
  }
 
  evaluatePostfix(arr: strOrNum[]): number {
    const stack: number[] = [];
 
    for (const token of arr) {
      if (typeof token === 'number') {
        stack.push(token);
        continue;
      }
 
      if (token === '!') {
        const operand = stack.pop();
        if (operand === undefined) throw new Error("Insufficient operands for '!'");
        stack.push(factorial(operand));
        continue;
      }
 
      const op1 = stack.pop();
      const op2 = stack.pop();
      if (op1 === undefined || op2 === undefined)
        throw new Error(`Insufficient operands for operator "${token}"`);
 
      stack.push(applyBinaryOp(token, op1, op2));
    }
 
    if (stack.length !== 1)
      throw new Error('Invalid expression: unexpected leftover values');
    if(stack[0])
      return stack[0];
    return 0
  }
 
  toggleSign(arr: strOrNum[]): strOrNum[] | string {
    if (arr.length === 0) return "Can't perform operation";
 
    const last = arr[arr.length - 1];
 
    if (typeof last === 'number') {
      arr[arr.length - 1] = -last;
      return arr;
    }
 
    if (last === ')') {
      const openIdx = this.findMatchingOpenParen(arr);
      if (openIdx !== -1) arr[openIdx] = '-(';
    }
 
    return arr;
  }


  private stackTop(): strOrNum {
    let c = this.operatorStack[this.operatorStack.length - 1]
    let ch: strOrNum = ""
    if(c) ch = c 
    return ch;
  }
 
  private readWord(str: string, idx: number): [string, number] {
    let word = '';
    while (idx < str.length && isLowerCaseLetter(str[idx] as string)) {
      word += str[idx++];
    }
    return [word, idx];
  }
 
  private consumeSignedNumber(str: string, idx: number, tokens: strOrNum[]): number {
    let sign = str[idx] === '-' ? -1 : 1;
    idx++;
 
    // Collapse consecutive signs: "---3" → -3
    while (idx < str.length && (str[idx] === '+' || str[idx] === '-')) {
      if (str[idx] === '-') sign *= -1;
      idx++;
    }
 
    let numStr = '';
    let hasDecimal = false;
    while (idx < str.length && isDigitOrDot(str[idx] as string)) {
      if (str[idx] === '.') {
        if (hasDecimal) throw new Error('Multiple decimal points in a number');
        hasDecimal = true;
      }
      numStr += str[idx++];
    }
 
    if (precedesImplicitMultiply(tokens)) tokens.push('*');
    tokens.push(numStr === '' ? sign : sign * Number(numStr));
    return idx;
  }
 
  private consumeUnsignedNumber(str: string, idx: number, tokens: strOrNum[]): number {
    let numStr = '';
    let hasDecimal = false;
    while (idx < str.length && isDigitOrDot(str[idx] as string)) {
      if (str[idx] === '.') {
        if (hasDecimal) throw new Error('Multiple decimal points in a number');
        hasDecimal = true;
      }
      numStr += str[idx++];
    }
 
    if (numStr) {
      if (precedesImplicitMultiply(tokens)) tokens.push('*');
      tokens.push(Number(numStr));
    }
    return idx;
  }
 
  private consumeScientificCall(str: string, idx: number, fnName: string, tokens: strOrNum[]): number {
    // Advance to the opening parenthesis
    while (idx < str.length && str[idx] !== '(') idx++;
    if (idx >= str.length) throw new Error(`Missing '(' after "${fnName}"`);
 
    let depth = 1;
    idx++; // skip '('
    let inner = '';
 
    while (idx < str.length && depth > 0) {
      if (str[idx] === '(') depth++;
      if (str[idx] === ')') depth--;
      if (depth > 0) inner += str[idx];
      idx++;
    }
 
    if (depth !== 0) throw new Error('Invalid parentheses.');
 
    const argValue = this.evaluatePostfix(this.postfix(this.tokenGenerator(inner)));
    const result = applyScientific(fnName, argValue);
 
    if (precedesImplicitMultiply(tokens)) tokens.push('*');
    tokens.push(result);
 
    return idx;
  }
 
  private findMatchingOpenParen(tokens: strOrNum[]): number {
    let depth = 0;
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i] === ')') depth++;
      if (tokens[i] === '(' || tokens[i] === '-(') depth--;
      if (depth === 0) return i;
    }
    return -1;
  }
}

export { Stack };
