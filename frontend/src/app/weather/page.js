'use client';
import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setActiveLocation, setActiveTab,
  fetchWeather, fetchAdvisory, reverseGeocode,
} from '@/store/slices/weatherSlice';
import LocationSearch       from '@/components/weather/LocationSearch';
import CurrentWeatherCard   from '@/components/weather/CurrentWeatherCard';
import SevenDayForecast     from '@/components/weather/SevenDayForecast';
import HourlyForecast       from '@/components/weather/HourlyForecast';
import WeatherAlerts        from '@/components/weather/WeatherAlerts';
import CropAdvisoryCard     from '@/components/weather/CropAdvisoryCard';
import { TemperatureChart, RainfallChart } from '@/components/weather/ForecastCharts';
import {
  CloudSun, Loader2, MapPin, RefreshCw,
  Clock, BarChart2, Leaf, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'current',  label: 'Current',   icon: CloudSun     },
  { id: 'forecast', label: 'Forecast',  icon: BarChart2    },
  { id: 'hourly',   label: 'Hourly',    icon: Clock        },
  { id: 'advisory', label: 'Advisory',  icon: Leaf         },
];

export default function WeatherPage() {
  const dispatch = useDispatch();
  const {
    activeLocation, activeTab,
    weatherData, weatherLoading, weatherError,
  } = useSelector(s => s.weather);

  const [gpsLoading, setGpsLoading] = useState(false);

  // ── GPS location detection ──────────────────────────────────────────────────
  const requestGPS = useCallback(() => {
    if (!navigator?.geolocation) {
      toast.error('GPS not supported in your browser');
      return;
    }
    setGpsLoading(true);
    toast('Detecting your location…', { icon: '📍' });

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        const loc = { name: 'My Location', lat, lon, display: 'Detecting…' };
        dispatch(setActiveLocation(loc));
        dispatch(fetchWeather({ lat, lon }));
        dispatch(fetchAdvisory({ lat, lon }));
        // Reverse geocode to get human-readable name
        const result = await dispatch(reverseGeocode({ lat, lon })).unwrap().catch(() => null);
        if (result) {
          dispatch(setActiveLocation({ name: result.name, lat, lon, display: result.display }));
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) toast.error('Location permission denied. Please search manually.');
        else toast.error('Could not get your location. Please search manually.');
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [dispatch]);

  // Auto-detect location on first visit
  useEffect(() => {
    if (!activeLocation) requestGPS();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh weather data
  const refresh = () => {
    if (!activeLocation) { toast.error('Select a location first'); return; }
    dispatch(fetchWeather({ lat: activeLocation.lat, lon: activeLocation.lon }));
    dispatch(fetchAdvisory({ lat: activeLocation.lat, lon: activeLocation.lon }));
    toast.success('Weather refreshed');
  };

  // Derived alert count for badge
  const alertCount = (() => {
    if (!weatherData?.daily) return 0;
    let n = 0;
    const { weather_code: codes = [], precipitation_probability_max: prob = [],
            temperature_2m_max: max = [], temperature_2m_min: min = [],
            wind_speed_10m_max: wind = [], precipitation_sum: rain = [] } = weatherData.daily;
    if (codes.some(c => c >= 95))               n++;
    if (rain.some(r => r > 50))                 n++;
    if (Math.max(...(prob  || [0])) >= 80)      n++;
    if (Math.max(...(max   || [0])) >= 42)      n++;
    if (Math.min(...(min   || [100])) <= 5)     n++;
    if (Math.max(...(wind  || [0])) >= 50)      n++;
    return n;
  })();

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-16">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CloudSun size={24} className="text-sky-400" />
              <h1 className="text-2xl font-bold text-slate-100">Weather Intelligence</h1>
            </div>
            <p className="text-sm text-slate-500">
              Real-time weather forecasts, alerts &amp; crop advisories for your farm
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={weatherLoading || !activeLocation}
            id="weather-refresh-btn"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 hover:border-slate-600 text-slate-300 text-sm rounded-xl transition-all disabled:opacity-40"
          >
            <RefreshCw size={14} className={weatherLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* ── Location Search ───────────────────────────────────────────────── */}
        <div className="mb-6">
          <LocationSearch onGpsRequest={requestGPS} />
        </div>

        {/* Active location pill */}
        {activeLocation && (
          <div className="flex items-center gap-2 mb-6">
            {gpsLoading
              ? <Loader2 size={14} className="animate-spin text-sky-400" />
              : <MapPin size={14} className="text-sky-400" />}
            <span className="text-sm text-slate-400">{activeLocation.display || activeLocation.name}</span>
            {weatherData && (
              <span className="text-xs text-slate-600 ml-auto">
                Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}

        {/* ── Loading skeleton ─────────────────────────────────────────────── */}
        {weatherLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-sky-400 animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">🌤️</span>
            </div>
            <p className="text-slate-400 text-sm">Fetching weather data…</p>
          </div>
        )}

        {/* ── Error state ───────────────────────────────────────────────────── */}
        {weatherError && !weatherLoading && (
          <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-red-500/20 mb-6">
            <p className="text-5xl mb-3">⛈️</p>
            <p className="text-red-400 font-medium mb-1">Failed to load weather</p>
            <p className="text-slate-500 text-sm mb-4">{weatherError}</p>
            <button onClick={refresh} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm rounded-xl transition-all">
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────────── */}
        {!weatherLoading && !weatherError && !weatherData && (
          <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/40">
            <p className="text-6xl mb-4">🌾</p>
            <h2 className="text-lg font-semibold text-slate-300 mb-2">Ready to Check the Weather?</h2>
            <p className="text-slate-500 text-sm mb-5">Allow location access or search for your city above</p>
            <button
              id="weather-detect-location-btn"
              onClick={requestGPS}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm rounded-xl font-medium transition-all"
            >
              <MapPin size={15} />
              Detect My Location
            </button>
          </div>
        )}

        {/* ── Main dashboard ─────────────────────────────────────────────────── */}
        {!weatherLoading && !weatherError && weatherData && (
          <div className="space-y-5">
            {/* Alerts banner (always visible when alerts exist) */}
            {alertCount > 0 && (
              <div id="weather-alerts-section">
                <WeatherAlerts weatherData={weatherData} />
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex gap-1 p-1 bg-slate-800/60 border border-slate-700/40 rounded-2xl w-full sm:w-auto sm:inline-flex">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`weather-tab-${tab.id}`}
                    onClick={() => dispatch(setActiveTab(tab.id))}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all relative
                      ${isActive
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                      }`}
                  >
                    <Icon size={15} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.id === 'advisory' && alertCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {alertCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Tab panels ─────────────────────────────────────────────────── */}

            {/* CURRENT */}
            {activeTab === 'current' && (
              <div id="weather-current-panel" className="space-y-5">
                <CurrentWeatherCard
                  data={weatherData}
                  locationName={activeLocation?.display || activeLocation?.name}
                />
                <SevenDayForecast data={weatherData} />
              </div>
            )}

            {/* FORECAST CHARTS */}
            {activeTab === 'forecast' && (
              <div id="weather-forecast-panel" className="space-y-5">
                <TemperatureChart data={weatherData} />
                <RainfallChart    data={weatherData} />
                <SevenDayForecast data={weatherData} />
              </div>
            )}

            {/* HOURLY */}
            {activeTab === 'hourly' && (
              <div id="weather-hourly-panel" className="space-y-5">
                <HourlyForecast data={weatherData} />
                <SevenDayForecast data={weatherData} />
              </div>
            )}

            {/* CROP ADVISORY */}
            {activeTab === 'advisory' && (
              <div id="weather-advisory-panel" className="space-y-5">
                <CropAdvisoryCard />
                {/* Also show today's quick summary */}
                <CurrentWeatherCard
                  data={weatherData}
                  locationName={activeLocation?.display || activeLocation?.name}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
