import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import * as expenseApi from "../services/expenses";
import * as loanApi from "../services/loans";
import { pad, todayStr } from "../utils/helpers";
import Login from "./Login";
import Home from "./Home";
import List from "./List";
import Budget from "./Budget";
import Loans from "./Loans";
import Total from "./Total";
import Profile from "./Profile";
import AddSheet from "./AddSheet";
import DeleteSheet from "./DeleteSheet";
import SplitSheet from "./SplitSheet";

const TABS = [
  ["home", "🏠", "Home"],
  ["expenses", "🧾", "Expenses"],
  ["budget", "🎯", "Budget"],
  ["loans", "🤝", "Give/Take"],
  ["total", "📊", "Total"],
];
const ROUTES = [...TABS, ["profile", "👤", "Profile"]];

const routeFromHash = () => {
  const key = window.location.hash.replace(/^#\/?/, "").split("?")[0] || "home";
  return ROUTES.some(([k]) => k === key) ? key : "home";
};

export default function Expenses() {
  const { user, ready, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState(routeFromHash);
  const [menu, setMenu] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [days, setDays] = useState(7);
  const [delId, setDelId] = useState(null);
  const [splitItem, setSplitItem] = useState(null);
  const [splitFriends, setSplitFriends] = useState([]);
  const [toast, setToast] = useState("");
  const uid = user?.id;

  const showToast = (msg) => setToast(msg);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Hash routing keeps the selected section in the URL, so refresh/deep links work.
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search + "#/home");
    }
    const sync = () => setTab(routeFromHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const go = (key) => {
    const target = `#/${key}`;
    if (window.location.hash !== target) window.location.hash = target;
    else setTab(key);
    setMenu(false);
  };

  useEffect(() => {
    // Wait for auth to finish loading, otherwise a refresh briefly has no user
    // and would wrongly reset the route to home.
    if (!ready) return;
    if (!uid) { setItems([]); go("home"); return; }
    expenseApi.list().then(setItems).catch((e) => showToast(e.message));
  }, [ready, uid]);

  const add = async (e) => {
    const x = await expenseApi.create(e);
    setItems((p) => [x, ...p]);
  };

  const saveEdit = async (e) => {
    const x = await expenseApi.update(editItem.id, e);
    setItems((p) => p.map((i) => (i.id === x.id ? x : i)));
  };

  const openSplit = (e) => {
    setSplitItem(e);
    loanApi.list().then((rows) => setSplitFriends(rows.map((r) => r.friend))).catch(() => setSplitFriends([]));
  };

  const quickAdd = async ({ category, amount }) => {
    try {
      const x = await expenseApi.create({ amount, category, date: todayStr(), desc: "Quick add", tags: [], recurring: false });
      setItems((p) => [x, ...p]);
      showToast(`Added ${category} · Rs ${amount}`);
    } catch (e) { showToast(e.message); }
  };

  const addRecurring = async (rows) => {
    const now = new Date();
    const maxDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const month = todayStr().slice(0, 7);
    try {
      for (const e of rows) {
        const day = pad(Math.min(Number(e.date.slice(8, 10)) || 1, maxDay));
        await expenseApi.create({
          amount: e.amount, category: e.category, date: `${month}-${day}`,
          desc: e.desc || "", tags: e.tags || [], recurring: true,
        });
      }
      setItems(await expenseApi.list());
      showToast(`Added ${rows.length} recurring expense${rows.length === 1 ? "" : "s"} for this month`);
    } catch (e) { showToast(e.message); }
  };

  const delItem = items.find((e) => e.id === delId);

  return (
    <div className={"ex-root" + (dark ? " dark" : "")}>
      <div className="ex-app">
        {!ready ? (
          <div className="ex-login"><div className="ex-logo">₨</div><p>Loading…</p></div>
        ) : !user ? (
          <Login />
        ) : (
          <>
            <div className={"ex-top" + (menu ? " menu-open" : "")}>
              <button className="ex-brand ex-brand-link" onClick={() => go("home")}>
                <span>₨</span><b>Kharcha</b>
              </button>
              <div className="ex-topr">
                <small>{new Date().toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" })}</small>
                <button className="ex-theme" onClick={toggle} aria-label="Switch light or dark mode">{dark ? "☀️" : "🌙"}</button>
                <div className="ex-profile-menu">
                  <button onClick={() => setMenu((v) => !v)} aria-label="Profile menu" aria-expanded={menu}>
                    {user.photo ? <img src={user.photo} alt="" /> : user.name?.[0]?.toUpperCase()}
                  </button>
                  {menu && (
                    <div className="ex-dropdown">
                      <button onClick={() => go("profile")}>👤 My profile</button>
                      <button onClick={() => { toggle(); setMenu(false); }}>{dark ? "☀️ Light mode" : "🌙 Dark mode"}</button>
                      <button className="danger" onClick={() => { logout(); setMenu(false); }}>🚪 Log out</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {menu && <div className="ex-menu-scrim" onClick={() => setMenu(false)} />}
            <div className="ex-body">
              {tab === "home" && (
                <Home user={user} items={items} days={days} setDays={setDays}
                  goBudget={() => go("budget")} goLoans={() => go("loans")}
                  quickAdd={quickAdd} addRecurring={addRecurring} />
              )}
              {tab === "expenses" && <List items={items} del={setDelId} edit={setEditItem} split={openSplit} />}
              {tab === "budget" && <Budget items={items} />}
              {tab === "loans" && <Loans />}
              {tab === "total" && <Total items={items} days={days} setDays={setDays} />}
              {tab === "profile" && <Profile items={items} goLoans={() => go("loans")} />}
            </div>
            {tab !== "loans" && tab !== "profile" && <button className="ex-fab" onClick={() => setSheet(true)} aria-label="Add expense">＋</button>}
            <nav className="ex-nav">
              {TABS.map(([k, i, l]) => (
                <button key={k} className={tab === k ? "on" : ""} onClick={() => go(k)}>
                  <span>{i}</span><small>{l}</small>
                </button>
              ))}
            </nav>
            {sheet && (
              <AddSheet
                onClose={() => setSheet(false)}
                onSave={(e) => add(e).then(() => setSheet(false))}
              />
            )}
            {editItem && (
              <AddSheet
                item={editItem}
                onClose={() => setEditItem(null)}
                onSave={(e) => saveEdit(e).then(() => setEditItem(null))}
              />
            )}
            {delItem && (
              <DeleteSheet
                item={delItem}
                onClose={() => setDelId(null)}
                onConfirm={() => { setItems((p) => p.filter((e) => e.id !== delId)); setDelId(null); }}
              />
            )}
            {splitItem && (
              <SplitSheet
                item={splitItem}
                friends={splitFriends}
                onClose={() => setSplitItem(null)}
                onDone={(count, amount) => {
                  setSplitItem(null);
                  showToast(`Split with ${count} friend${count === 1 ? "" : "s"} · ${amount} owed to you`);
                }}
              />
            )}
            {toast && <div className="ex-toast" onClick={() => setToast("")}>{toast}</div>}
          </>
        )}
      </div>
    </div>
  );
}
