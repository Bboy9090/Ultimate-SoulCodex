import { lifePath } from "../../services/numerology";

export function calcLifePath(dateISO: string): number {
  return lifePath(dateISO) ?? 0;
}
