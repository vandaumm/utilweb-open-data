import { calculate, formatValue, parseValue } from "./moedas.helper.js";
import { isValidDomElements } from "./validation.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. DOM Elements
  type DomElements = {
    inputA: HTMLInputElement | null;
    inputB: HTMLInputElement | null;
    labelA: Element | null;
    labelB: Element | null;
    btnSwap: HTMLElement | null;
    config: HTMLElement | null;
  };

  const dom: DomElements = {
    inputA: document.getElementById("input-a") as HTMLInputElement | null,
    inputB: document.getElementById("input-b") as HTMLInputElement | null,
    btnSwap: document.getElementById("btn-swap"),
    config: document.getElementById("moeda-config"),
    labelA: document.querySelector('label[for="input-a"]'),
    labelB: document.querySelector('label[for="input-b"]'),
  };

  const domRefs = [
    "inputA",
    "inputB",
    "labelA",
    "labelB",
    "btnSwap",
    "config",
  ] as const;

  if (!isValidDomElements(dom, domRefs)) return;

  let rate = parseFloat(dom.config.dataset.rate ?? "0");

  let isSwapped = false;

  // Formats the field when user leaves it (Blur)
  function formatInput(e: InputEvent) {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const val = parseValue(target.value);
      if (val !== 0) {
        target.value = formatValue(val);
      }
    }
  }

  // Listeners
  dom.inputA.addEventListener("input", () =>
    calculate("a", dom.inputA, dom.inputB, isSwapped, rate),
  );
  dom.inputB.addEventListener("input", () =>
    calculate("b", dom.inputA, dom.inputB, isSwapped, rate),
  );

  dom.inputA.addEventListener("change", () => formatInput);
  dom.inputB.addEventListener("change", () => formatInput);

  // --- SWAP BUTTON ---
  if (dom.btnSwap) {
    dom.btnSwap.addEventListener("click", () => {
      isSwapped = !isSwapped;

      // 1. Swap Labels
      const tempText = dom.labelA.textContent;
      dom.labelA.textContent = dom.labelB.textContent;
      dom.labelB.textContent = tempText;

      // 2. Swap Values
      const valTop = dom.inputA.value;
      const valBottom = dom.inputB.value;

      dom.inputA.value = valBottom;
      dom.inputB.value = valTop;

      // Animation
      dom.btnSwap.classList.toggle("swapped");
    });
  }
  calculate("a", dom.inputA, dom.inputB, isSwapped, rate);
});
