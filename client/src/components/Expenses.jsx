import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import * as expenseApi from "../services/expenses";
import Login from "./Login";
import Home from "./Home";
import List from "./List";
import Budget from "./Budget";
import Loans from "./Loans";
import Total from "./Total";
import Profile from "./Profile";
import AddSheet from "./AddSheet";
import DeleteSheet from "./DeleteSheet";

const TABS = [
  ["home", "🏠", "Home"],
  ["expenses", "🧾", "Expenses"],
  ["budget", "🎯", "Budget"],
  ["loans", "🤝", "Give/Take"],
  ["total", "📊", "Total"],
  ["profile", "👤", "Profile"],
];

export default function Expenses() {
  const { user, ready } = useAuth();
  const { dark, toggle } = useTheme();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [days, setDays] = useState(7);
  const [delId, setDelId] = useState(null);
  const uid = user?.id;

  useEffect(() => {
    if (!uid) { setItems([]); setTab("home"); return; }
    expenseApi.list().then(setItems).catch((e) => alert(e.message));
  }, [uid]);

  const add = async (e) => {
    const x = await expenseApi.create(e);
    setItems((p) => [x, ...p]);
  };

  const saveEdit = async (e) => {
    const x = await expenseApi.update(editItem.id, e);
    setItems((p) => p.map((i) => (i.id === x.id ? x : i)));
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
            <div className="ex-top">
              <div className="ex-brand"><span>₨</span><b>Kharcha</b></div>
              <div className="ex-topr">
                <small>{new Date().toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" })}</small>
                <button className="ex-theme" onClick={toggle} aria-label="Switch light or dark mode">{dark ? "☀️" : "🌙"}</button>
                <button onClick={() => setTab("profile")} aria-label="Profile">
                  {user.photo ? <img src={user.photo} alt="" /> : user.name?.[0]?.toUpperCase()}
                </button>
              </div>
            </div>
            <div className="ex-body">
              {tab === "home" && <Home user={user} items={items} days={days} setDays={setDays} goBudget={() => setTab("budget")} goLoans={() => setTab("loans")} />}
              {tab === "expenses" && <List items={items} del={setDelId} edit={setEditItem} />}
              {tab === "budget" && <Budget items={items} />}
              {tab === "loans" && <Loans />}
              {tab === "total" && <Total items={items} days={days} setDays={setDays} />}
              {tab === "profile" && <Profile items={items} />}
            </div>
            {tab !== "loans" && <button className="ex-fab" onClick={() => setSheet(true)} aria-label="Add expense">＋</button>}
            <nav className="ex-nav">
              {TABS.map(([k, i, l]) => (
                <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
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
          </>
        )}
      </div>
    </div>
  );
}
