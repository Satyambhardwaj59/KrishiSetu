'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

// Custom tooltip style
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600/60 rounded-xl px-3.5 py-2.5 shadow-xl text-xs">
      <p className="text-slate-300 font-medium mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold ml-1">{p.value}{p.unit || ''}</span>
        </p>
      ))}
    </div>
  );
};

export function TemperatureChart({ data }) {
  if (!data?.daily) return null;

  const chartData = (data.daily.time || []).map((t, i) => ({
    day  : new Date(t).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
    Max  : Math.round(data.daily.temperature_2m_max?.[i] ?? 0),
    Min  : Math.round(data.daily.temperature_2m_min?.[i] ?? 0),
  }));

  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5">
      <h3 className="text-base font-semibold text-slate-100 mb-4">Temperature Trend (7 Days)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="°" axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }} />
          <Area type="monotone" dataKey="Max" stroke="#f97316" strokeWidth={2} fill="url(#maxGrad)" unit="°C" dot={{ fill: '#f97316', r: 3 }} />
          <Area type="monotone" dataKey="Min" stroke="#38bdf8" strokeWidth={2} fill="url(#minGrad)" unit="°C" dot={{ fill: '#38bdf8', r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RainfallChart({ data }) {
  if (!data?.daily) return null;

  const chartData = (data.daily.time || []).map((t, i) => ({
    day  : new Date(t).toLocaleDateString('en-IN', { weekday: 'short' }),
    'Rain (mm)'    : parseFloat((data.daily.precipitation_sum?.[i] ?? 0).toFixed(1)),
    'Rain Prob (%)': data.daily.precipitation_probability_max?.[i] ?? 0,
  }));

  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5">
      <h3 className="text-base font-semibold text-slate-100 mb-4">Rainfall Forecast (7 Days)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }} />
          <Bar dataKey="Rain (mm)"     fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="Rain Prob (%)" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
