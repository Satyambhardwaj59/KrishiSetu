'use client';
import { AlertTriangle, CloudRain, Zap, Wind, Thermometer, Eye, Snowflake, X } from 'lucide-react';
import { useState } from 'react';

const ALERT_CONFIG = {
  heavy_rain  : { icon: CloudRain,    color: 'blue',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-300'   },
  thunderstorm: { icon: Zap,          color: 'purple',  bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-300' },
  heatwave    : { icon: Thermometer,  color: 'red',     bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-300'    },
  cold_wave   : { icon: Snowflake,    color: 'cyan',    bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   text: 'text-cyan-300'   },
  strong_wind : { icon: Wind,         color: 'amber',   bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-300'  },
  fog         : { icon: Eye,          color: 'slate',   bg: 'bg-slate-500/10',  border: 'border-slate-500/30',  text: 'text-slate-300'  },
  default     : { icon: AlertTriangle,color: 'orange',  bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-300' },
};

function detectAlertType(title = '') {
  const t = title.toLowerCase();
  if (t.includes('rain') || t.includes('rainfall')) return 'heavy_rain';
  if (t.includes('thunder') || t.includes('storm'))  return 'thunderstorm';
  if (t.includes('heat'))                             return 'heatwave';
  if (t.includes('cold') || t.includes('frost'))     return 'cold_wave';
  if (t.includes('wind'))                             return 'strong_wind';
  if (t.includes('fog'))                              return 'fog';
  return 'default';
}

function AlertBadge({ text, type }) {
  const cfg = ALERT_CONFIG[type] || ALERT_CONFIG.default;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      ⚠ {text}
    </span>
  );
}

export default function WeatherAlerts({ weatherData }) {
  const [dismissed, setDismissed] = useState([]);

  if (!weatherData?.daily) return null;

  // Derive alerts from raw weather data on the client
  const codes   = weatherData.daily.weather_code   || [];
  const maxTemps = weatherData.daily.temperature_2m_max || [];
  const minTemps = weatherData.daily.temperature_2m_min || [];
  const rainProbs = weatherData.daily.precipitation_probability_max || [];
  const rains    = weatherData.daily.precipitation_sum || [];
  const winds    = weatherData.daily.wind_speed_10m_max || [];

  const alerts = [];

  if (codes.some(c => c >= 95))
    alerts.push({ id: 'thunder', type: 'thunderstorm', title: '⛈️ Thunderstorm Warning', body: 'A thunderstorm is forecast for the next 7 days. Secure loose farm equipment and avoid open fields during the storm.' });

  if (rains.some(r => r > 50) || codes.some(c => [65, 82].includes(c)))
    alerts.push({ id: 'rain', type: 'heavy_rain', title: '🌧️ Heavy Rainfall Alert', body: 'Heavy rain exceeding 50mm is expected. Ensure proper drainage channels are clear to prevent field waterlogging.' });

  if (Math.max(...rainProbs) >= 80)
    alerts.push({ id: 'rain_prob', type: 'heavy_rain', title: '☔ High Rain Probability', body: `Rain probability exceeds ${Math.max(...rainProbs)}% in the forecast. Postpone pesticide and fertilizer application.` });

  if (Math.max(...maxTemps) >= 42)
    alerts.push({ id: 'heat', type: 'heatwave', title: '🌡️ Heatwave Alert', body: `Temperatures may rise to ${Math.round(Math.max(...maxTemps))}°C. Irrigate during cooler hours and provide shade to sensitive crops.` });

  if (Math.min(...minTemps) <= 5)
    alerts.push({ id: 'cold', type: 'cold_wave', title: '🥶 Cold Wave Warning', body: `Temperature may drop to ${Math.round(Math.min(...minTemps))}°C. Use frost protection covers on sensitive crops overnight.` });

  if (Math.max(...winds) >= 50)
    alerts.push({ id: 'wind', type: 'strong_wind', title: '💨 Strong Wind Warning', body: `Wind speeds up to ${Math.round(Math.max(...winds))} km/h expected. Stake tall crops and postpone aerial spraying.` });

  const visible = alerts.filter(a => !dismissed.includes(a.id));

  if (!visible.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-slate-100">Active Weather Alerts</h3>
        <span className="ml-1 bg-orange-500/20 text-orange-300 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-500/30">
          {visible.length}
        </span>
      </div>

      {visible.map(alert => {
        const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG.default;
        const Icon = cfg.icon;
        return (
          <div
            key={alert.id}
            className={`relative flex items-start gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border} animate-fadeIn`}
          >
            <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.text} shrink-0 mt-0.5`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${cfg.text} mb-1`}>{alert.title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{alert.body}</p>
            </div>
            <button
              onClick={() => setDismissed(prev => [...prev, alert.id])}
              className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 p-0.5"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
