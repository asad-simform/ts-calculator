import { Stack } from "./stack.js";
import { History } from "./history.js"; 
import { scientificOp } from './types.js'

const conatiner = document.querySelector<HTMLDivElement>(".grid-container")!;
const input = document.querySelector<HTMLInputElement>("input")!

if (!conatiner) throw new Error("Could not find .grid-container in the DOM");
if (!input) throw new Error("Could not find input element in the DOM");

const st = new Stack()
const hs = new History()



function setInput(value: string): void {
  input.value = value;
}
 
function handleReciprocal(): void {
  const res = st.resiprocal(input.value);
  if (res === null) {
    setInput("Can't divide by zero");
    return;
  }
  hs.appendHistory(`1/(${input.value})`, res);
  setInput(String(res));
}
 
function handleToggleSign(): void {
  const tokens = st.tokenGenerator(input.value);
  const result = st.toggleSign(tokens);
  if (typeof result === "string") {
    setInput(result);
  } else {
    setInput(result.join(""));
  }
}
 
function handleEqual(): void {
  try {
    const tokens = st.tokenGenerator(input.value);
    const post = st.postfix(tokens);
    const res = st.evaluatePostfix(post);
    
    const formatted = parseFloat(res.toFixed(10)).toString();
    hs.appendHistory(input.value, res);
    setInput(formatted);
  } catch (error) {
    setInput(error instanceof Error ? error.message : "Error");
  }
}

conatiner.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (!target?.dataset) return;
 
  const type = Object.keys(target.dataset)[0];
 
  switch (type) {
    case "number":
    case "operator":
      setInput(input.value + (target.textContent ?? ""));
      break;
 
    case "scientific": {
      const fn = target.dataset.scientific ?? "";
      if (st.scientificArr.includes(fn as scientificOp)) {
        setInput(input.value + fn + "(");
      } else {
        setInput(input.value + fn);
      }
      break;
    }
 
    case "func":
      switch (target.dataset.func) {
        case "ac":
          setInput("");
          break;
        case "del":
          setInput(input.value.slice(0, -1));
          break;
        case "!":
          setInput(input.value + "!");
          break;
        case "res":
          handleReciprocal();
          break;
        case "toggle":
          handleToggleSign();
          break;
      }
      break;
 
    case "bracket":
      setInput(input.value + (target.dataset.bracket ?? ""));
      break;
 
    case "equal":
      handleEqual();
      break;
  }
});

 
hs.loadLocal();