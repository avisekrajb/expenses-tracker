export const monthsToDays = (n) => {
  const e = new Date();
  const st = new Date(e.getFullYear(), e.getMonth() - n, e.getDate());
  return Math.round((e - st) / 864e5);
};
export const PERIODS = [
  ["Daily", 1], ["3 Days", 3], ["Weekly", 7], ["10 Days", 10], ["15 Days", 15], ["20 Days", 20],
  ["1 Month", monthsToDays(1)],
  ...Array.from({ length: 10 }, (_, i) => [`${i + 2} Months`, monthsToDays(i + 2)]),
  ...Array.from({ length: 10 }, (_, i) => [`${i + 1} Year${i ? "s" : ""}`, monthsToDays(12 * (i + 1))]),
];
