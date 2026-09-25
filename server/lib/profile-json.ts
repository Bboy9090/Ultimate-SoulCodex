import { parseDateOnly } from "@soulcodex/core";

export function storedBirthDateToDateOnly(value: unknown): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new RangeError("Stored birth date is invalid");
    }
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const candidate = value.slice(0, 10);
    parseDateOnly(candidate);
    return candidate;
  }

  throw new RangeError("Stored birth date is unavailable");
}

export function serializeProfileForJson<T extends { birthDate: unknown }>(
  profile: T,
): Omit<T, "birthDate"> & { birthDate: string } {
  return {
    ...profile,
    birthDate: storedBirthDateToDateOnly(profile.birthDate),
  };
}
