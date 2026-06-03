'use client';

const ICON_MAP = {
  sunny : '☀️',
  cloudy: '☁️',
  rainy : '🌧️',
  stormy: '⛈️',
  fog   : '🌫️',
  snowy : '❄️',
};

export default function SevenDayForecast({ data }) {
  if (!data?.daily) return null;
  const { daily } = data;

  const days = (daily.time || []).map((date, i) => ({
    date  : new Date(date),
    max   : daily.temperature_2m_max?.[i],
    min   : daily.temperature_2m_min?.[i],
    rain  : daily.precipitation_sum?.[i] ?? 0,
    prob  : daily.precipitation_probability_max?.[i] ?? 0,
    wind  : daily.wind_speed_10m_max?.[i] ?? 0,
    cond  : daily.condition?.[i] || 'Clear Sky',
    icon  : daily.icon?.[i] || 'sunny',
  }));

  // Determine temperature range across all 7 days for relative bar sizing
  const allMax = days.map(d => d.max);
  const allMin = days.map(d => d.min);
  const globalMax = Math.max(...allMax);
  const globalMin = Math.min(...allMin);
  const range = globalMax - globalMin || 1;

  const dayName = (date, idx) => {
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/40">
        <h3 className="text-base font-semibold text-slate-100">7-Day Forecast</h3>
      </div>
      <div className="divide-y divide-slate-700/30">
        {days.map((day, idx) => {
          const barLeft  = ((day.min - globalMin) / range) * 100;
          const barWidth = ((day.max - day.min)   / range) * 100;
          return (
            <div key={idx} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-700/20 transition-colors">
              {/* Day name */}
              <span className={`w-20 text-sm font-medium shrink-0 ${idx === 0 ? 'text-sky-300' : 'text-slate-300'}`}>
                {dayName(day.date, idx)}
              </span>

              {/* Emoji + condition */}
              <div className="flex items-center gap-2 w-32 shrink-0">
                <span className="text-xl">{ICON_MAP[day.icon] || '🌤️'}</span>
                <span className="text-xs text-slate-400 truncate hidden sm:block">{day.cond}</span>
              </div>

              {/* Rain probability */}
              {day.prob > 0 && (
                <span className="text-xs text-sky-400 font-medium w-10 shrink-0">
                  💧{day.prob}%
                </span>
              )}
              {day.prob === 0 && <span className="w-10 shrink-0" />}

              {/* Temperature range bar */}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-sky-400 font-medium w-8 text-right shrink-0">
                  {Math.round(day.min)}°
                </span>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 h-full rounded-full bg-gradient-to-r from-sky-400 to-orange-400"
                    style={{ left: `${barLeft}%`, width: `${Math.max(barWidth, 8)}%` }}
                  />
                </div>
                <span className="text-xs text-orange-400 font-medium w-8 shrink-0">
                  {Math.round(day.max)}°
                </span>
              </div>

              {/* Wind */}
              <span className="text-xs text-slate-500 w-16 text-right shrink-0 hidden md:block">
                💨 {Math.round(day.wind)} km/h
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
