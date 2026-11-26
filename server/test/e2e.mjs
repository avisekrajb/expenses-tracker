/* End-to-end smoke test for the Kharcha API. Run with the server on BASE. */
import { round2, sumMoney, splitMoney, pct, deltaPct } from "../../client/src/utils/money.js";

const BASE = process.env.BASE || "http://localhost:5055";
const email = `test_${Date.now()}@kharcha.test`;
const password = "testpass123";
let token = "";
let pass = 0;
let fail = 0;

const ok = (cond, label, extra = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label} ${extra}`); }
};

const req = async (method, path, body, headers = {}) => {
  const opts = { method, headers: { ...headers } };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data, headers: res.headers };
};

const waitForServer = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE + "/healthz");
      if (r.ok) return;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Server did not start");
};

// Money math (fixed in v1.4: integer paisa, symmetric rounding, exact splits).
ok(round2(1.005) === 1.01 && round2(-1.005) === -1.01, "money rounding is symmetric");
ok(sumMoney([0.1, 0.2, 0.3]) === 0.6, "money sums avoid floating-point drift");
const shares = splitMoney(1000.01, 3);
ok(sumMoney(shares) === 1000.01 && shares[0] === 333.34, "split shares add up exactly", JSON.stringify(shares));
ok(pct(1, 0) === 0 && deltaPct(10, 0) === null, "zero denominators are safe");

await waitForServer();
console.log("Server is up:", BASE);

let r = await req("GET", "/api/health");
ok(r.status === 200 && r.data?.ok === true, "GET /api/health", JSON.stringify(r.data));
ok(r.data?.cloudinary === true, "Cloudinary is configured");

// CORS
r = await fetch(BASE + "/api/health", { headers: { Origin: "https://demo.vercel.app" } });
ok(r.headers.get("access-control-allow-origin") === "https://demo.vercel.app", "CORS allows *.vercel.app");

// Auth
r = await req("POST", "/api/auth/signup", { name: "Test User", email, password });
ok(r.status === 201, "POST /api/auth/signup", JSON.stringify(r.data));
r = await req("POST", "/api/auth/signup", { name: "Test User", email, password });
ok(r.status === 409, "duplicate signup rejected");
r = await req("POST", "/api/auth/signup", { name: "", email: "bad", password: "1" });
ok(r.status === 400, "invalid signup rejected");
r = await req("POST", "/api/auth/login", { email, password: "wrong" });
ok(r.status === 401, "wrong password rejected");
r = await req("POST", "/api/auth/login", { email, password });
ok(r.status === 200 && r.data?.token, "POST /api/auth/login");
token = r.data?.token;
r = await req("GET", "/api/auth/me");
ok(r.status === 200 && r.data?.email === email && !r.data?.password, "GET /api/auth/me hides password");

// Unauthorized
const saved = token; token = "";
r = await req("GET", "/api/expenses");
ok(r.status === 401, "expenses require auth");
token = saved;

// Expenses
const today = new Date().toISOString().slice(0, 10);
r = await req("POST", "/api/expenses", { amount: 250.5, category: "Eating", date: today, desc: "Momo at Thamel" });
ok(r.status === 201 && r.data?.id && r.data?.amount === 250.5, "POST /api/expenses");
const expenseId = r.data?.id;
r = await req("POST", "/api/expenses", { amount: -5, category: "Eating", date: today });
ok(r.status === 400, "negative amount rejected");
r = await req("POST", "/api/expenses", { amount: 10, category: "Nope", date: today });
ok(r.status === 400, "invalid category rejected");
r = await req("POST", "/api/expenses", { amount: 10, category: "Travel", date: "26-11-2026" });
ok(r.status === 400, "invalid date rejected");
r = await req("POST", "/api/expenses", { amount: 99, category: "Travel", date: today, desc: "Bus" });
const expense2 = r.data?.id;

r = await req("GET", "/api/expenses");
ok(r.status === 200 && Array.isArray(r.data) && r.data.length >= 2, "GET /api/expenses");

r = await req("PUT", `/api/expenses/${expenseId}`, { amount: 300, category: "Eating", date: today, desc: "Momo + tea" });
ok(r.status === 200 && r.data?.amount === 300 && r.data?.desc === "Momo + tea", "PUT /api/expenses/:id");
r = await req("PUT", `/api/expenses/${expenseId}`, { amount: 0, category: "Eating", date: today });
ok(r.status === 400, "invalid update rejected");
r = await req("PUT", `/api/expenses/${expenseId}`, { amount: 300, category: "Eating", date: today, desc: "Momo + tea", tags: ["food", "friends", "food"], recurring: true });
ok(r.status === 200 && r.data?.tags?.length === 2 && r.data?.recurring === true, "tags and recurring saved", JSON.stringify(r.data));

// Summary
const from = today;
const to = today;
r = await req("GET", `/api/expenses/summary?from=${from}&to=${to}`);
ok(r.status === 200 && r.data?.total === 399 && r.data?.count === 2, "GET /api/expenses/summary", JSON.stringify(r.data));
ok(r.data?.byTag?.find((t) => t.tag === "food")?.total === 300 && r.data?.recurring?.count === 1, "summary includes tags and recurring", JSON.stringify(r.data));
r = await req("GET", `/api/expenses/summary?from=${today}&to=2020-01-01`);
ok(r.status === 400, "summary validates date order");

// Budgets
const month = today.slice(0, 7);
r = await req("GET", `/api/budgets/${month}`);
ok(r.status === 200 && r.data?.overall === 0, "GET /api/budgets/:month defaults");
r = await req("PUT", `/api/budgets/${month}`, { overall: 10000, categories: { Eating: 4000, Travel: 1500 } });
ok(r.status === 200 && r.data?.overall === 10000 && r.data?.categories?.Eating === 4000, "PUT /api/budgets/:month");
r = await req("GET", `/api/budgets/${month}`);
ok(r.data?.categories?.Travel === 1500, "budget persists");
r = await req("PUT", `/api/budgets/${month}`, { overall: -1 });
ok(r.status === 400, "invalid budget rejected");
r = await req("GET", "/api/budgets/2026-13");
ok(r.status === 400, "invalid month rejected");

// Give & Take (friend loans)
r = await req("POST", "/api/loans", { type: "given", friend: "Sita", amount: 500, date: today, dueDate: today, note: "Hostel rent share" });
ok(r.status === 201 && r.data?.type === "given" && r.data?.settled === false, "POST /api/loans (given)", JSON.stringify(r.data));
const givenId = r.data?.id;
r = await req("POST", "/api/loans", { type: "taken", friend: "Anish", amount: 200, date: today, note: "Bus fare" });
ok(r.status === 201 && r.data?.type === "taken", "POST /api/loans (taken)");
const takenId = r.data?.id;
r = await req("POST", "/api/loans", { type: "given", friend: "", amount: 10, date: today });
ok(r.status === 400, "loan without friend rejected");
r = await req("POST", "/api/loans", { type: "lent", friend: "Ram", amount: 10, date: today });
ok(r.status === 400, "invalid loan type rejected");
r = await req("POST", "/api/loans", { type: "given", friend: "Ram", amount: -10, date: today });
ok(r.status === 400, "invalid loan amount rejected");
r = await req("POST", "/api/loans", { type: "given", friend: "Ram", amount: 10, date: today, dueDate: "26-11-2026" });
ok(r.status === 400, "invalid loan due date rejected");
r = await req("GET", "/api/loans");
ok(r.status === 200 && Array.isArray(r.data) && r.data.length === 2, "GET /api/loans");
r = await req("GET", "/api/loans?type=given");
ok(r.status === 200 && r.data.length === 1 && r.data[0].friend === "Sita", "loans filter by type");
r = await req("GET", "/api/loans?q=sita");
ok(r.status === 200 && r.data.length === 1, "loans search by friend");
r = await req("GET", "/api/loans/summary");
ok(r.status === 200 && r.data?.toReceive === 500 && r.data?.toPay === 200 && r.data?.net === 300, "GET /api/loans/summary", JSON.stringify(r.data));
r = await req("PUT", `/api/loans/${givenId}/settle`, { settled: true });
ok(r.status === 200 && r.data?.settled === true && Boolean(r.data?.settledAt), "settle a loan");
r = await req("GET", "/api/loans/summary");
ok(r.data?.toReceive === 0 && r.data?.received === 500, "summary updates after settle");
r = await req("PUT", `/api/loans/${givenId}`, { type: "given", friend: "Sita Devi", amount: 600, date: today });
ok(r.status === 200 && r.data?.friend === "Sita Devi" && r.data?.settled === false, "PUT /api/loans/:id reopens edited record", JSON.stringify(r.data));
r = await req("PUT", `/api/loans/${takenId}`, { type: "taken", friend: "Anish", amount: 250, date: today, settled: true });
ok(r.status === 200 && r.data?.amount === 250 && r.data?.settled === true, "edit and settle in one update");
r = await req("PUT", "/api/loans/not-an-id/settle", { settled: true });
ok(r.status === 400, "invalid loan id rejected");
r = await req("DELETE", `/api/loans/${givenId}`);
ok(r.status === 200 && r.data?.ok === true, "DELETE /api/loans/:id");
r = await req("DELETE", `/api/loans/${givenId}`);
ok(r.status === 404, "delete missing loan -> 404");

const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
r = await req("POST", "/api/loans", { type: "taken", friend: "Late Friend", amount: 75, date: yesterday, dueDate: yesterday });
const overdueId = r.data?.id;
r = await req("GET", "/api/loans/summary");
ok(r.data?.overdue === 1 && r.data?.overdueAmount === 75, "overdue loan counted", JSON.stringify(r.data));
r = await req("DELETE", `/api/loans/${overdueId}`);
ok(r.status === 200, "overdue test loan removed");

// Receipt upload (Cloudinary)
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const fd = new FormData();
fd.append("receipt", new Blob([png], { type: "image/png" }), "receipt.png");
r = await fetch(BASE + "/api/uploads/receipt", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
const upload = await r.json().catch(() => null);
ok(r.status === 201 && /^https:\/\/res\.cloudinary\.com\//.test(upload?.url || ""), "POST /api/uploads/receipt -> Cloudinary", JSON.stringify(upload));

// Expense with receipt + edit keeps/removes it
r = await req("POST", "/api/expenses", { amount: 120, category: "Others", date: today, desc: "Receipt test", receipt: upload?.url, receiptPublicId: upload?.publicId });
ok(r.status === 201 && r.data?.receipt === upload?.url && !r.data?.receiptPublicId, "create expense with receipt (public id hidden)");
const receiptExpenseId = r.data?.id;
r = await req("PUT", `/api/expenses/${receiptExpenseId}`, { amount: 130, category: "Others", date: today, desc: "Receipt test edited", receipt: upload?.url });
ok(r.status === 200 && r.data?.receipt === upload?.url, "edit expense keeps receipt");
r = await req("PUT", `/api/expenses/${receiptExpenseId}`, { amount: 130, category: "Others", date: today, desc: "No receipt", receipt: null });
ok(r.status === 200 && r.data?.receipt === null, "edit expense removes receipt");

// Delete
r = await req("DELETE", `/api/expenses/${expense2}`, { password: "wrong" });
ok(r.status === 403, "delete with wrong password rejected");
r = await req("DELETE", `/api/expenses/${expense2}`, { password });
ok(r.status === 200 && r.data?.ok === true, "DELETE /api/expenses/:id with password");
r = await req("DELETE", `/api/expenses/${expense2}`, { password });
ok(r.status === 404, "delete missing expense -> 404");

// Delete budget
r = await req("DELETE", `/api/budgets/${month}`);
ok(r.status === 200, "DELETE /api/budgets/:month");
r = await req("GET", `/api/budgets/${month}`);
ok(r.data?.overall === 0, "budget cleared");

// Profile update (name + Cloudinary avatar)
const pfd = new FormData();
pfd.append("photo", new Blob([png], { type: "image/png" }), "avatar.png");
pfd.append("name", "Renamed User");
r = await fetch(BASE + "/api/users/me", { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: pfd });
const profile = await r.json().catch(() => null);
ok(r.status === 200 && profile?.name === "Renamed User" && /^https:\/\/res\.cloudinary\.com\//.test(profile?.photo || ""), "PUT /api/users/me uploads avatar to Cloudinary", JSON.stringify(profile));
r = await req("DELETE", "/api/users/me/photo");
ok(r.status === 200 && r.data?.photo === null, "DELETE /api/users/me/photo");

// Cleanup
try {
  const mongoose = (await import("mongoose")).default;
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGODB_DB || "expensetracker_test" });
  const User = (await import("../src/models/User.js")).default;
  const Expense = (await import("../src/models/Expense.js")).default;
  const Budget = (await import("../src/models/Budget.js")).default;
  const Loan = (await import("../src/models/Loan.js")).default;
  const user = await User.findOne({ email });
  if (user) {
    await Expense.deleteMany({ userId: user._id });
    await Budget.deleteMany({ userId: user._id });
    await Loan.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
  }
  await mongoose.disconnect();
  console.log("  cleanup  test user and data removed");
} catch (e) {
  console.log("  cleanup warning:", e.message);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
