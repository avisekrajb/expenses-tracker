import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Empty from "./Empty";
import { fmt } from "../utils/helpers";

export const Tip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="ex-tip"><b>{label || payload[0].name}</b><br />{fmt(payload[0].value)}</div>
  ) : null;

export default function Pie3({ data }) {
  if (!data.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip content={<Tip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
