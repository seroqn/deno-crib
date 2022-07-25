export function strWidth(str: string) {
  return [...str].reduce(
    (cnt: number, char: string) => cnt + Math.min(new Blob([char]).size, 2),
    0,
  );
}
