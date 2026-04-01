import { IStack, strOrNum, scientificArr, priorityType, scientificOp } from '../src/types'

class Stack implements IStack {
    
    private stack: strOrNum[]
    private scientificArr: scientificArr
    constructor() {
        this.stack = []    
        this.scientificArr = ["sin", "cos", "tan", "log", "ln", "sqrt"]
    }

    private isNumber(ch: string): boolean {
        return (ch >= "0" && ch <= "9") || ch === "."
    }

    private isCharacter(ch: string): boolean {
        return ch >= "a" && ch <= "z"
    }

    private priority(ch: string): priorityType {
        if(ch === "+" || ch === "-") return 1
        else if(ch === "/" || ch === "*" || ch === "%") return 2
        else if(ch === "^") return 3
        else if(ch === "!" || ch === "minus") return 4
        else return -1
    }

    private scientificOperator(op: string, val: number): number {        
        switch(op) {
            case "sin": 
                return Math.sin(val)
            case "cos":
                return Math.cos(val)
            case "tan":
                return Math.tan(val)
            case "log":
                return Math.log10(val)
            case "ln":
                return Math.log(val)
            case "sqrt":
                return Math.sqrt(val)
        }
        return 0
    }

    private factorial(val: number): number | never {
        if(val < 0) throw new Error("Can't find the factorial for negative number")
        if(val === 0) return 1
        let res = 1
        for(let i = 1;i<=val;i++) {
            res *= i
        }
        return res
    }

    private isRightAssociative(ch: string): boolean {
        return ch === "^"
    }

    standardOperation(operand: string, op1: number, op2: number) {
        const map: Record<string, (a: number, b:number) => number> = {
            "+": (a: number, b: number) => a + b,
            "-": (a: number, b: number) => a - b,
            "*": (a: number, b: number) => a * b,
            "/": (a: number, b: number) => a / b,
            "^": (a: number, b: number) => Math.pow(b,a),
            "%": (a: number, b: number) => a % b
        }

        const fn = map[operand]
        if(!fn) throw new Error("function undefined")
        if(operand === "/" && op1 === 0) throw new Error("Can't divide by zero")
        return fn(op1, op2)
    }


    resiprocal(str: string): number | null {
        let token = this.tokenGenerator(str)
        let post = this.postfix(token)
        let res = this.evaluatePostfix(post)    
        if(res === 0) return null
        return 1/res 
    }

    private peek(str: string, idx: number): string {
        if(str[idx]) return str[idx]
        return ""
    }

    tokenGenerator(str: string): strOrNum[] {        
        let arrConverter: strOrNum[] = []
        let idx = 0
        let open = 0, close = 0;
        while(idx < str.length) {  
            let num = ""
            let topEle = ""
            let t = <string>arrConverter[arrConverter.length - 1]
            if(t) topEle = t
            if(idx<str.length && 
                ["+", "-"].includes(this.peek(str, idx)) &&
                 (idx===0 || arrConverter[arrConverter.length - 1] === "(" || ["+", "-", "*", "/", "(", "^", "%"].includes(topEle) ) && 
                 arrConverter[arrConverter.length - 1] !== "!"){
                let flag = false
                let neg = str[idx]==="+" ? 1 : -1
                idx++
                while(idx<str.length && !this.isNumber(this.peek(str, idx)) && ["+", "-"].includes(this.peek(str, idx))) {
                    if(str[idx] === "-") neg *= -1
                    idx++
                }
                while(idx<str.length && this.isNumber(this.peek(str, idx))){
                    if(str[idx]==="." && flag)throw new Error("Multiple decimal point not allowed")
                    if(str[idx]==="." && !flag) flag = true
                    num += str[idx]
                    idx++;
                }
                if(arrConverter.length>0 && (arrConverter[arrConverter.length - 1] === ")" || arrConverter[arrConverter.length - 1] === Math.PI || arrConverter[arrConverter.length - 1] === Math.E )) arrConverter.push("*")
                if(num==="") arrConverter.push(neg)
                else arrConverter.push(neg * Number(num))
                num = ""
            }
            if (idx<str.length && this.isNumber(this.peek(str, idx))) {
                let flag = false 
                while (idx < str.length && this.isNumber(this.peek(str, idx))) {
                    if(str[idx]==="." && flag)throw new Error("Multiple decimal point not allowed")
                    if(str[idx]==="." && !flag) flag = true
                    num += str[idx];
                    idx++;
                }
                if(num!=="") {
                    if(arrConverter.length>0 && (arrConverter[arrConverter.length - 1] === ")" || arrConverter[arrConverter.length - 1] === Math.PI || arrConverter[arrConverter.length - 1] === Math.E )) arrConverter.push("*")
                    arrConverter.push(Number(num));
                }
                num = ""
            }
            while(idx<str.length && this.isCharacter(this.peek(str, idx))) {
                num += str[idx]
                idx++;
            }
            if(this.scientificArr.includes(num as scientificOp)) {
                // console.log(idx);
                
                let evl = ""
                let paran = -1
                let start = -1
                let end = -1
                while(idx<str.length) {
                    if(str[idx]==="(") {
                        paran = 1
                        end = idx
                        idx++
                        break
                    }
                    idx++
                }
                while(idx<str.length) {
                    if(str[idx] === "(") paran++
                    if(str[idx] === ")") paran--
                    if(paran === 0) {
                        start = idx 
                        break
                    }
                    evl += str[idx]
                    idx++
                }
                // console.log(evl);
                
                // while(idx+1<str.length && str[idx+1] !== ")") {
                //     evl += str[idx+1]
                //     idx++
                // }
                if(paran === 0) {
                    if(arrConverter.length > 0 && (typeof arrConverter[arrConverter.length - 1] === "number")) arrConverter.push("*")
                    let number = this.evaluatePostfix(this.postfix(this.tokenGenerator(evl)))
                    let result = this.scientificOperator(num, number)
                     arrConverter.push(result)
                } else {
                    throw new Error("Invalid parantheses")
                }
                num = ""
                idx++
            }
            if(idx<str.length && str[idx] === "π") {
                if(arrConverter.length > 0 && (typeof arrConverter[arrConverter.length - 1] === "number" || arrConverter[arrConverter.length - 1] === ")")) arrConverter.push("*")
                arrConverter.push(Math.PI)
                idx++
            }
            if(idx<str.length && str[idx] === "ℯ") {
                if(arrConverter.length > 0 && (typeof arrConverter[arrConverter.length - 1] === "number" || arrConverter[arrConverter.length - 1] === ")")) arrConverter.push("*")
                arrConverter.push(Math.E)
                idx++
            }
            if(idx<str.length && !this.isNumber(this.peek(str, idx)) && !this.isCharacter(this.peek(str, idx))) {
                if(str[idx] === "(") {
                    if(arrConverter.length > 0 && (typeof arrConverter[arrConverter.length - 1] === "number" || arrConverter[arrConverter.length - 1] === ")")) arrConverter.push("*")
                    open++
                } 
                else if(str[idx] === ")") {
                    close++
                }
                arrConverter.push(this.peek(str, idx))
                idx++
            }
        }
        if(open != close) throw new Error("Invalid parantheses")
        return arrConverter
    }

    postfix(arr: strOrNum[]): strOrNum[] {
        const post: strOrNum[] = []
        let idx = 0;
        this.stack = []

        while(idx < arr.length) {
            let el = arr[idx]
            if(typeof arr[idx] === "number" && el != null) post.push(el)
            else if(arr[idx] === "(" && el != null) this.stack.push(el)
            else if(arr[idx] === ")") {
                while(this.stack.length >= 0 && this.stack[this.stack.length - 1] !== "(") {
                    let top = this.stack.pop()
                    if(top)
                        post.push(top)
                }
                this.stack.pop()
            } else {
                let stackTop = ""
                let currEle = ""
                const t = this.stack[this.stack.length - 1];
                const c = arr[idx]
                if(t != null && typeof t === "string") stackTop = t
                if(c !== undefined && typeof c === "string") currEle = c 
                while(this.stack.length > 0 && stackTop !== "(" && (this.priority(currEle) < this.priority(stackTop) || (this.priority(currEle) === this.priority(stackTop) && !this.isRightAssociative(currEle)))) {
                    let num = this.stack.pop()
                    if(num)
                        post.push(num)
                }
                this.stack.push(currEle)
            } 
            idx++        
        }
        while(this.stack.length > 0) {
            let top = this.stack.pop()
            if(top)
                post.push(top)
        }
        return post
    }
 
    evaluatePostfix(arr: strOrNum[]): number {
        let stack: number[] = []
        let idx = 0;
        
        while(idx < arr.length) {
            let el = arr[idx]
            if(el != undefined && typeof el === "number") stack.push(el)
            else if(arr[idx] === "!") {
                let num = stack.pop()
                if(num !== undefined && typeof num === "number") stack.push(this.factorial(num))
            }
            else {
                let op1 = stack.pop()
                let op2 = stack.pop()
                let operand = arr[idx]

                if((op1 === undefined || typeof op1 !== "number") || (op2 === undefined || typeof op2 !== "number") || (operand === undefined || typeof operand !== "string")) throw new Error("Insufficient operands for operator");
                
                this.standardOperation(operand, op1, op2)
            }
            idx++
        }
        if(stack[0])
            return stack[0]
        return 0
    }

    toggleSign(arr: strOrNum[]): strOrNum[] | string {
        let paran = -1
        let start = -1, end = -1
        let idx = arr.length - 1
        if(arr.length === 0) return "Can't perform operation";        
        let last = arr[arr.length - 1]
        if(typeof last === "number") {
            arr[arr.length - 1] = -1 * last
        } else {
            while(idx>=0) {
                if(arr[idx] === ")") {
                    paran = 1
                    end = idx
                    idx--
                    break
                }
                idx--
            }
            while(idx>=0) {
                if(arr[idx] === ")") paran++
                if(arr[idx] === "(") paran--
                if(paran === 0) {
                    start = idx 
                    break
                }
                idx--
            }
            if(start !== -1) {
                arr[start] = "-("
            }
        }
        return arr
    }

}


export { Stack }