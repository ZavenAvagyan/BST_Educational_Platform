export interface ParsedIntegerResult {
  ok: boolean;
  value?: number;
  error?: string;
}

export function parseIntegerInput(raw: string): ParsedIntegerResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'Enter an integer value.' };
  }
  if (!/^-?\d+$/.test(trimmed)) {
    return { ok: false, error: 'Value must be a whole integer (e.g. 30).' };
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isSafeInteger(parsed) || parsed < -999 || parsed > 9999) {
    return { ok: false, error: 'Enter an integer between -999 and 9999.' };
  }
  return { ok: true, value: parsed };
}

export interface ParsedSequenceResult {
  ok: boolean;
  values?: number[];
  error?: string;
}

export function parseSequenceInput(raw: string): ParsedSequenceResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'Enter comma- or space-separated integers (e.g. 40, 20, 60, 10, 30).' };
  }
  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  if (tokens.length === 0) {
    return { ok: false, error: 'Enter at least one integer.' };
  }
  if (tokens.length > 25) {
    return { ok: false, error: 'Keep sequences to 25 values or fewer for clear visualization.' };
  }

  const values: number[] = [];
  const seen = new Set<number>();

  for (const token of tokens) {
    const res = parseIntegerInput(token);
    if (!res.ok || res.value === undefined) {
      return { ok: false, error: `Invalid integer "${token}".` };
    }
    if (!seen.has(res.value)) {
      seen.add(res.value);
      values.push(res.value);
    }
  }

  return { ok: true, values };
}
