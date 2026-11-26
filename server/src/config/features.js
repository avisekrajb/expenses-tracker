// Every switchable feature. Keys are used by the API, admin UI and per-user overrides.
export const FEATURES = {
  expenses: "Expenses & daily tracking",
  budgets: "Monthly budgets",
  loans: "Give & Take loans",
  reports: "Reports & charts",
  receipts: "Receipt photos",
  tags: "Tags & search",
  splitBills: "Split bills",
  recurring: "Recurring expenses",
  donations: "Donations",
  twoFactor: "Two-step verification",
  notifications: "Device notifications",
  install: "Installable app",
};

export const FEATURE_KEYS = Object.keys(FEATURES);
export const DEFAULT_FEATURES = Object.fromEntries(FEATURE_KEYS.map((key) => [key, true]));
