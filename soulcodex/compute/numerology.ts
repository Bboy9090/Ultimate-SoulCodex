export function calcLifePath(dateISO: string): number {
  const cleaned = dateISO.replace(/-/g, "");
  let sum = 0;
  for (const ch of cleaned) {
    const d = parseInt(ch, 10);
    if (!isNaN(d)) sum += d;
  }
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    let next = 0;
    while (sum > 0) {
      next += sum % 10;
      sum = Math.floor(sum / 10);
    }
    sum = next;
  }
  return sum;
}
