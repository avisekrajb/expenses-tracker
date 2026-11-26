/* Money math is done in integer paisa so floating-point drift cannot leak into totals. */

export const toCents = (n) => {
  const x = Number(n);
  return Number.isFinite(x) ? Math.round(x * 100) : 0;
};

export const fromCents = (c) => Math.round(Number(c) || 0) / 100;

// Half-away-from-zero rounding, unlike Math.round which rounds negative halves up.
export const round2 = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.sign(x) * Math.round(Math.abs(x) * 100 + 1e-9) / 100;
};

export const sumMoney = (values = []) => fromCents(values.reduce((s, v) => s + toCents(v), 0));

export const pct = (part, whole) => {
  const w = Number(whole);
  return w > 0 ? round2((Number(part) / w) * 100) : 0;
};

export const clampPct = (part, whole) => Math.min(100, Math.max(0, pct(part, whole)));

export const deltaPct = (current, previous) => {
  const p = Number(previous);
  return p > 0 ? round2(((Number(current) - p) / p) * 100) : null;
};

export const divMoney = (total, n) => {
  const count = Number(n);
  return count > 0 ? round2(Number(total) / count) : 0;
};

// Split an amount into exactly n shares whose sum is the original amount.
// The leftover paisa are distributed one by one so nothing is lost to rounding.
export const splitMoney = (total, n) => {
  const count = Math.max(0, Math.floor(Number(n) || 0));
  if (!count) return [];
  const cents = toCents(total);
  const sign = cents < 0 ? -1 : 1;
  const abs = Math.abs(cents);
  const base = Math.floor(abs / count);
  const remainder = abs - base * count;
  return Array.from({ length: count }, (_, i) => sign * (base + (i < remainder ? 1 : 0)) / 100);
};
