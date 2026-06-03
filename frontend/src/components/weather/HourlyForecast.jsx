'use client';

const ICON_MAP = {
  sunny : '☀️', cloudy: '☁️', rainy: '🌧️',
  stormy: '⛈️', fog   : '🌫️', snowy: '❄️',
};

export default function HourlyForecast({ data }) {
  if (!data?.hourly) return null;

  // Show next 24 hours from current time
  const now = new Date();
  const hourlyTimes = data.hourly.time || [];

  const hours = hourlyTimes
    .map((t, i) => ({
      time : new Date(t),
      temp : data.hourly.temperature_2m?.[i],
      prob : data.hourly.precipitation_probability?.[i] ?? 0,
      rain : data.hourly.precipitation?.[i] ?? 0,
      icon : data.hourly.icon?.[i] || 'sunny',
      wind : data.hourly.wind_speed_10m?.[i] ?? 0,
    }))
    .filter(h => h.time >= now)
    .slice(0, 24);

  if (!hours.length) return null;

  const minTemp = Math.min(...hours.map(h => h.temp));
  const maxTemp = Math.max(...hours.map(h => h.temp));
  const range   = maxTemp - minTemp || 1;

  const formatHour = (date) => {
    const h = date.getHours();
    if (h === 0) return '12am';
    if (h === 12) return '12pm';
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/40">
        <h3 className="text-base font-semibold text-slate-100">Hourly Forecast – Next 24 Hours</h3>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-0 min-w-max px-2 py-4">
          {hours.map((h, idx) => {
            const barHeightPct = ((h.temp - minTemp) / range) * 60 + 20; // 20–80% height
            const isNow = idx === 0;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl min-w-[64px] transition-all
                  ${isNow ? 'bg-sky-600/20 border border-sky-500/40' : 'hover:bg-slate-700/40'}`}
              >
                <span className={`text-xs font-medium ${isNow ? 'text-sky-300' : 'text-slate-400'}`}>
                  {isNow ? 'Now' : formatHour(h.time)}
                </span>

                <span className="text-xl">{ICON_MAP[h.icon] || '🌤️'}</span>

                {/* Temperature bar */}
                <div className="flex flex-col items-center gap-1 w-full">
                  <div className="h-16 w-full flex items-end justify-center">
                    <div
                      className={`w-2 rounded-full transition-all ${
                        h.prob > 60 ? 'bg-blue-400' :
                        h.temp > 35 ? 'bg-orange-400' :
                        'bg-gradient-to-t from-sky-500 to-sky-300'
                      }`}
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${isNow ? 'text-sky-200' : 'text-slate-200'}`}>
                    {Math.round(h.temp)}°
                  </span>
                </div>

                {/* Rain probability */}
                {h.prob > 0 && (
                  <span className="text-xs text-sky-400 font-medium">
                    {h.prob}%
                  </span>
                )}
                {h.prob === 0 && <span className="text-xs text-transparent">-</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
