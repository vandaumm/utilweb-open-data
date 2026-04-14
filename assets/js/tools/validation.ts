export function isValidDomElements<T extends object>(
  dom: T,
  elements: readonly (keyof T)[],
): dom is { [K in keyof T]: NonNullable<T[K]> } {
  for (const element of elements) {
    if (!dom[element]) {
      console.error(`Elemento '${String(element)}' não encontrado`);
      return false;
    }
  }
  return true;
}
