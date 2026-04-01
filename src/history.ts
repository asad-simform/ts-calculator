import { IHistory } from './types.js';

class History implements IHistory {
  calHistory: HTMLDivElement;
  clearBtn: HTMLButtonElement;
  constructor() {
    this.calHistory = document.querySelector<HTMLDivElement>('.cal-history')!;
    this.clearBtn = document.querySelector<HTMLButtonElement>('.clear-his')!;

    this.clearBtn.addEventListener('click', () => {
      if (localStorage.getItem('calculator')) {
        localStorage.removeItem('calculator');
        this.calHistory.replaceChildren();
      }
    });
  }

  appendHistory(expression: string, res: number): void {
    const div = document.createElement('div');
    div.classList.add('history-div');
    const textNode = document.createTextNode(`${expression} = ${res}`);
    div.append(textNode);
    this.calHistory.prepend(div);
    const hist = localStorage.getItem('calculator');
    if (!hist) {
      localStorage.setItem('calculator', JSON.stringify([{ expression, res }]));
    } else {
      const arr = JSON.parse(hist);
      arr.unshift({ expression, res });
      localStorage.setItem('calculator', JSON.stringify(arr));
    }
  }

  loadLocal(): void {
    const hist = localStorage.getItem('calculator');
    if (hist) {
      const arr = JSON.parse(hist);
      for (const element of arr) {
        const div = document.createElement('div');
        div.classList.add('history-div');
        const textNode = document.createTextNode(
          `${element.expression} = ${element.res}`,
        );
        div.append(textNode);
        this.calHistory.append(div);
      }
    }
  }
}

export { History };
