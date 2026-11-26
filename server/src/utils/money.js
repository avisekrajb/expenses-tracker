const toCents = (n) => {
  const x = Number(n);
  return Number.isFinite(x) ? Math.round(x * 100) : 0;
};

export const round2 = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.sign(x) * Math.round(Math.abs(x) * 100 + 1e-9) / 100;
};

export const sumMoney = (values = []) => values.reduce((s, v) => s + toCents(v), 0) / 100;

export const pct = (part, whole) => {
  const w = Number(whole);
  return w > 0 ? round2((Number(part) / w) * 100) : 0;
};
