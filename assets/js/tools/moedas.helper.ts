// --- HELPER FUNCTIONS ---

// Converts string "1.000,00" to float 1000.00 (Brazilian Format)
export function parseValue(str: string) {
  if (!str) return 0;
  // Correct logic for pt-BR: remove dots (thousands) and replace comma with dot (decimal)
  let clean = str.replace(/\./g, "").replace(",", ".");
  let val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
}

// Formats float to "1.000,00" (Brazilian Format)
export function formatValue(val: number) {
  if (val === 0) return "";

  let maxDigits = Math.abs(val) < 1.0 ? 8 : 2;

  // Use 'pt-BR' as requested by the owner
  return val.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDigits,
  });
}

// --- CALCULATION ---
type Source = "a" | "b";
export function calculate(
  source: Source,
  inputA: HTMLInputElement,
  inputB: HTMLInputElement,
  isSwapped: boolean,
  rate: number,
) {
  if (source === "a") {
    const rawA = inputA.value;
    const valA = parseValue(rawA);

    let res = isSwapped ? valA / rate : valA * rate;
    inputB.value = formatValue(res);
  } else {
    const rawB = inputB.value;
    const valB = parseValue(rawB);

    let res = isSwapped ? valB * rate : valB / rate;
    inputA.value = formatValue(res);
  }
}
