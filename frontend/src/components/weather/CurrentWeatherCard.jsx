'use client';
import { Thermometer, Wind, Droplets, Eye, Gauge, Zap, Sun, Sunset, ArrowUp, ArrowDown } from 'lucide-react';

// Map icon slug → emoji + gradient
const CONDITION_STYLES = {
  sunny : { emoji: '☀️', gradient: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', text: 'text-amber-300' },
  cloudy: { emoji: '☁️', gradient: 'from-slate-500/20 to-slate-600/10', border: 'border-slate-500/30', text: 'text-slate-300' },
  rainy : { emoji: '🌧️', gradient: 'from-blue-500/20 to-cyan-500/10',   border: 'border-blue-500/30',  text: 'text-blue-300'  },
  stormy: { emoji: '⛈️', gradient: 'from-purple-500/20 to-slate-600/10', border: 'border-purple-500/30', text: 'text-purple-300' },
  fog   : { emoji: '🌫️', gradient: 'from-slate-400/20 to-slate-500/10', border: 'border-slate-400/30', text: 'text-slate-400' },
  snowy : { emoji: '❄️', gradient: 'from-cyan-400/20 to-blue-400/10',   border: 'border-cyan-400/30',  text: 'text-cyan-300'  },
};

// Wind direction from degrees
const windDir = (deg) => {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
};

function StatTile({ icon: Icon, label, value, sub, color = 'sky' }) {
  const colors = {
    sky   : 'bg-sky-500/10 text-sky-400',
    blue  : 'bg-blue-500/10 text-blue-400',
    amber : 'bg-amber-500/10 text-amber-400',
    green : 'bg-green-500/10 text-green-400',
    violet: 'bg-violet-500/10 text-violet-400',
    rose  : 'bg-rose-500/10 text-rose-400',
    teal  : 'bg-teal-500/10 text-teal-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };
  return (
    <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/40 rounded-xl p-3.5 hover:border-slate-600/60 transition-all">
      <div className={`p-2.5 rounded-xl shrink-0 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-100 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function CurrentWeatherCard({ data, locationName }) {
  if (!data) return null;

  const c   = data.current || {};
  const d   = data.daily   || {};
  const style = CONDITION_STYLES[c.icon] || CONDITION_STYLES.sunny;

  const todayMax = d.temperature_2m_max?.[0];
  const todayMin = d.temperature_2m_min?.[0];
  const sunrise  = d.sunrise?.[0]  ? new Date(d.sunrise[0]).toLocaleTimeString('en-IN',  { hour: '2-digit', minute: '2-digit' }) : '--';
  const sunset   = d.sunset?.[0]   ? new Date(d.sunset[0]).toLocaleTimeString('en-IN',   { hour: '2-digit', minute: '2-digit' }) : '--';

  const uvLabel = (uv) => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };

  return (
    <div className={`rounded-2xl border ${style.border} bg-gradient-to-br ${style.gradient} backdrop-blur-md overflow-hidden`}>
      {/* Hero section */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              📍 {locationName || 'Your Location'}
            </p>
            <h2 className="text-6xl font-bold text-white leading-none mb-1">
              {Math.round(c.temperature_2m ?? 0)}°
            </h2>
            <p className={`text-base font-medium mt-2 ${style.text}`}>{c.condition}</p>
            <p className="text-sm text-slate-400 mt-1">
              Feels like {Math.round(c.apparent_temperature ?? 0)}°C
            </p>
          </div>
          <div className="text-7xl select-none drop-shadow-lg">{style.emoji}</div>
        </div>

        {/* High / Low */}
        {todayMax !== undefined && (
          <div className="flex items-center gap-4 mt-4">
            <span className="flex items-center gap-1 text-sm text-rose-400 font-medium">
              <ArrowUp size={14} /> {Math.round(todayMax)}°
            </span>
            <span className="flex items-center gap-1 text-sm text-sky-400 font-medium">
              <ArrowDown size={14} /> {Math.round(todayMin)}°
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-700/40 mx-6" />

      {/* Stats grid */}
      <div className="p-6 pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile icon={Droplets}    label="Humidity"    value={`${c.relative_humidity_2m ?? '--'}%`}                         color="blue"   />
        <StatTile icon={Wind}        label="Wind"        value={`${c.wind_speed_10m ?? '--'} km/h`}  sub={windDir(c.wind_direction_10m)} color="sky"    />
        <StatTile icon={Gauge}       label="Pressure"    value={`${c.surface_pressure?.toFixed(0) ?? '--'} hPa`}               color="violet" />
        <StatTile icon={Eye}         label="Visibility"  value={`${((c.visibility ?? 0) / 1000).toFixed(1)} km`}              color="teal"   />
        <StatTile icon={Zap}         label="UV Index"    value={`${c.uv_index ?? '--'}`}             sub={uvLabel(c.uv_index)} color="amber"  />
        <StatTile icon={Thermometer} label="Feels Like"  value={`${Math.round(c.apparent_temperature ?? 0)}°C`}               color="rose"   />
        <StatTile icon={Sun}         label="Sunrise"     value={sunrise}                                                       color="orange" />
        <StatTile icon={Sunset}      label="Sunset"      value={sunset}                                                        color="orange" />
      </div>
    </div>
  );
}
