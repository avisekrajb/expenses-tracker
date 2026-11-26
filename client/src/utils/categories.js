export const CATS = [
  { n: "Travel", i: "🚌", c: "#6366f1" },
  { n: "Eating", i: "🍜", c: "#f97316" },
  { n: "Hostel Rent", i: "🛏️", c: "#14b8a6" },
  { n: "Water", i: "💧", c: "#0ea5e9" },
  { n: "Clothes", i: "👕", c: "#ec4899" },
  { n: "Medicine", i: "💊", c: "#ef4444" },
  { n: "Hair Cut", i: "✂️", c: "#a855f7" },
  { n: "Recharge", i: "📱", c: "#eab308" },
  { n: "Home", i: "🏡", c: "#22c55e" },
  { n: "Others", i: "📦", c: "#64748b" },
];

export const catOf = (n) => CATS.find((c) => c.n === n) || CATS[9];
