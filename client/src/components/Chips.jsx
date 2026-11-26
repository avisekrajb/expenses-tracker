import React from "react";
import { PERIODS } from "../utils/periods";

export default function Chips({ days, setDays }) {
  return (
    <div className="ex-chips">
      {PERIODS.map(([l, d]) => (
        <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>{l}</button>
      ))}
    </div>
  );
}
