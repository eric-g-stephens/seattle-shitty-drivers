export function normalizePlate(raw: string): string {
  return raw.toUpperCase().replace(/[\s\-·.]/g, "");
}

export function validatePlate(raw: string): string | null {
  const plate = normalizePlate(raw);
  if (!plate) return "License plate is required";
  if (plate.length > 8) return "License plate too long (max 8 characters)";
  if (!/^[A-Z0-9]+$/.test(plate)) return "License plate must be letters and numbers only";
  return null;
}
