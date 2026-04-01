import { strOrNum, scientificArr, priorityType } from './types.js';

const SCIENTIFIC_FUNCTIONS: scientificArr = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'];
const SIGN_TRIGGER_OPS = new Set(['+', '-', '*', '/', '(', '^', '%']);

function isDigitOrDot(ch: string): boolean {
  return (ch >= '0' && ch <= '9') || ch === '.';
}
 
function isLowerCaseLetter(ch: string): boolean {
  return ch >= 'a' && ch <= 'z';
}
 
function isRightAssociative(op: string): boolean {
  return op === '^';
}

function getPriority(ch: string): priorityType {
  if (ch === '+' || ch === '-') return 1;
  if (ch === '/' || ch === '*' || ch === '%') return 2;
  if (ch === '^') return 3;
  if (ch === '!' || ch === 'minus') return 4;
  return -1;
}
 
function applyScientific(op: string, val: number): number {
  switch (op) {
    case 'sin':  return Math.sin(val);
    case 'cos':  return Math.cos(val);
    case 'tan':  return Math.tan(val);
    case 'log':  return Math.log10(val);
    case 'ln':   return Math.log(val);
    case 'sqrt': return Math.sqrt(val);
    default:     throw new Error(`Unknown scientific function: "${op}"`);
  }
}

function applyBinaryOp(operand: string, op1: number, op2: number): number {
  switch (operand) {
    case '+': return op2 + op1;
    case '-': return op2 - op1;
    case '*': return op2 * op1;
    case '/':
      if (op1 === 0) throw new Error("Can't divide by zero");
      return op2 / op1;
    case '^': return Math.pow(op2, op1);
    case '%': return op2 % op1;
    default:  throw new Error(`Unknown operator: "${operand}"`);
  }
}
 
function factorial(val: number): number {
  if (!Number.isInteger(val) || val < 0)
    throw new Error("Factorial is only defined for non-negative integers");
  let res = 1;
  for (let i = 2; i <= val; i++) res *= i;
  return res;
}

function precedesImplicitMultiply(tokens: strOrNum[]): boolean {
  if (tokens.length === 0) return false;
  const last = tokens[tokens.length - 1];
  if(typeof last === "number" && (last === Math.PI || last === Math.E)) return true  
  return typeof last === 'number' || last === ')'
}

export {
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
}