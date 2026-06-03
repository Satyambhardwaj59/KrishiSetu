const axios    = require('axios');
const User     = require('../models/User');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');

// ─── Open-Meteo base URLs ─────────────────────────────────────────────────────
const GEO_URL     = 'https://geocoding-api.open-meteo.com/v1';
const WEATHER_URL = 'https://api.open-meteo.com/v1';

// WMO weather codes → description + condition slug
const WMO_CODES = {
  0: { desc: 'Clear Sky', icon: 'sunny' },
  1: { desc: 'Mainly Clear', icon: 'sunny' },
  2: { desc: 'Partly Cloudy', icon: 'cloudy' },
  3: { desc: 'Overcast', icon: 'cloudy' },
  45: { desc: 'Foggy', icon: 'fog' },
  48: { desc: 'Icy Fog', icon: 'fog' },
  51: { desc: 'Light Drizzle', icon: 'rainy' },
  53: { desc: 'Moderate Drizzle', icon: 'rainy' },
  55: { desc: 'Dense Drizzle', icon: 'rainy' },
  61: { desc: 'Slight Rain', icon: 'rainy' },
  63: { desc: 'Moderate Rain', icon: 'rainy' },
  65: { desc: 'Heavy Rain', icon: 'rainy' },
  71: { desc: 'Slight Snow', icon: 'snowy' },
  73: { desc: 'Moderate Snow', icon: 'snowy' },
  75: { desc: 'Heavy Snow', icon: 'snowy' },
  77: { desc: 'Snow Grains', icon: 'snowy' },
  80: { desc: 'Slight Showers', icon: 'rainy' },
  81: { desc: 'Moderate Showers', icon: 'rainy' },
  82: { desc: 'Violent Showers', icon: 'stormy' },
  85: { desc: 'Slight Snow Showers', icon: 'snowy' },
  86: { desc: 'Heavy Snow Showers', icon: 'snowy' },
  95: { desc: 'Thunderstorm', icon: 'stormy' },
  96: { desc: 'Thunderstorm w/ Hail', icon: 'stormy' },
  99: { desc: 'Thunderstorm w/ Heavy Hail', icon: 'stormy' },
};

/**
 * GET /api/weather?lat=&lon=
 * Fetch full weather data: current + hourly (24h) + daily (7d)
 */
exports.getWeather = async (req, res, next) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return next(new ApiError(400, 'lat and lon query params are required'));

  const params = {
    latitude : lat,
    longitude: lon,
    timezone : 'auto',
    current  : [
      'temperature_2m', 'apparent_temperature', 'relative_humidity_2m',
      'wind_speed_10m', 'wind_direction_10m', 'weather_code',
      'surface_pressure', 'visibility', 'uv_index', 'is_day',
    ].join(','),
    hourly: [
      'temperature_2m', 'precipitation_probability', 'precipitation',
      'weather_code', 'wind_speed_10m',
    ].join(','),
    daily: [
      'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum',
      'precipitation_probability_max', 'weather_code', 'wind_speed_10m_max',
      'sunrise', 'sunset',
    ].join(','),
    forecast_days: 7,
  };

  const { data } = await axios.get(`${WEATHER_URL}/forecast`, { params });

  // Annotate current weather code
  const wmo = WMO_CODES[data.current?.weather_code] || { desc: 'Unknown', icon: 'sunny' };
  data.current.condition = wmo.desc;
  data.current.icon      = wmo.icon;

  // Annotate daily weather codes
  if (data.daily?.weather_code) {
    data.daily.condition = data.daily.weather_code.map(c => WMO_CODES[c]?.desc || 'Unknown');
    data.daily.icon      = data.daily.weather_code.map(c => WMO_CODES[c]?.icon || 'sunny');
  }

  // Annotate hourly weather codes (first 24)
  if (data.hourly?.weather_code) {
    data.hourly.condition = data.hourly.weather_code.map(c => WMO_CODES[c]?.desc || 'Unknown');
    data.hourly.icon      = data.hourly.weather_code.map(c => WMO_CODES[c]?.icon || 'sunny');
  }

  sendSuccess(res, 200, 'Weather data fetched', data);
};

/**
 * GET /api/weather/search?q=CityName
 * Geocoding: search location by name
 */
exports.searchLocation = async (req, res, next) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return next(new ApiError(400, 'Query must be at least 2 characters'));

  const { data } = await axios.get(`${GEO_URL}/search`, {
    params: { name: q.trim(), count: 8, language: 'en', format: 'json' },
  });

  const results = (data.results || []).map(r => ({
    id     : r.id,
    name   : r.name,
    lat    : r.latitude,
    lon    : r.longitude,
    country: r.country || '',
    state  : r.admin1 || '',
    display: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
  }));

  sendSuccess(res, 200, 'Locations found', results);
};

/**
 * GET /api/weather/reverse?lat=&lon=
 * Reverse geocode coordinates to location name
 */
exports.reverseGeocode = async (req, res, next) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return next(new ApiError(400, 'lat and lon are required'));

  // Open-Meteo geocoding does not support reverse, use nominatim
  const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
    params : { lat, lon, format: 'json' },
    headers: { 'User-Agent': 'KrishiSetu/1.0 (agricultural-platform)' },
  });

  const addr = data.address || {};
  const locationName = addr.village || addr.town || addr.city || addr.county || addr.state || 'Unknown';

  sendSuccess(res, 200, 'Location resolved', {
    name   : locationName,
    state  : addr.state || '',
    country: addr.country || '',
    display: [locationName, addr.state, addr.country].filter(Boolean).join(', '),
  });
};

/**
 * GET /api/weather/saved  – list saved locations (auth required)
 */
exports.getSavedLocations = async (req, res) => {
  const user = await User.findById(req.user._id).select('savedLocations');
  sendSuccess(res, 200, 'Saved locations', user.savedLocations);
};

/**
 * POST /api/weather/saved  – save a location (auth required)
 */
exports.saveLocation = async (req, res, next) => {
  const { name, lat, lon, country } = req.body;
  if (!name || lat == null || lon == null) return next(new ApiError(400, 'name, lat, lon are required'));

  const user = await User.findById(req.user._id).select('savedLocations');
  if (user.savedLocations.length >= 5) return next(new ApiError(400, 'Maximum 5 saved locations allowed'));

  const exists = user.savedLocations.some(l => Math.abs(l.lat - lat) < 0.01 && Math.abs(l.lon - lon) < 0.01);
  if (exists) return next(new ApiError(409, 'Location already saved'));

  user.savedLocations.push({ name, lat: Number(lat), lon: Number(lon), country: country || '' });
  await user.save();
  sendSuccess(res, 201, 'Location saved', user.savedLocations);
};

/**
 * DELETE /api/weather/saved/:index  – remove a saved location (auth required)
 */
exports.deleteSavedLocation = async (req, res, next) => {
  const idx = Number(req.params.index);
  const user = await User.findById(req.user._id).select('savedLocations');

  if (isNaN(idx) || idx < 0 || idx >= user.savedLocations.length)
    return next(new ApiError(400, 'Invalid location index'));

  user.savedLocations.splice(idx, 1);
  await user.save();
  sendSuccess(res, 200, 'Location removed', user.savedLocations);
};

/**
 * GET /api/weather/advisory?lat=&lon=
 * Generate rule-based crop advisory from forecast (auth required)
 */
exports.getCropAdvisory = async (req, res, next) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return next(new ApiError(400, 'lat and lon required'));

  const { data } = await axios.get(`${WEATHER_URL}/forecast`, {
    params: {
      latitude : lat,
      longitude: lon,
      timezone : 'auto',
      daily: [
        'temperature_2m_max', 'temperature_2m_min',
        'precipitation_sum', 'precipitation_probability_max',
        'wind_speed_10m_max', 'weather_code',
      ].join(','),
      current: ['temperature_2m', 'relative_humidity_2m', 'uv_index'].join(','),
      forecast_days: 3,
    },
  });

  const advisories = generateAdvisories(data);
  sendSuccess(res, 200, 'Crop advisory generated', advisories);
};

// ─── Advisory Generation Engine ───────────────────────────────────────────────
function generateAdvisories(data) {
  const tips    = [];
  const daily   = data.daily   || {};
  const current = data.current || {};

  const maxRainProb = Math.max(...(daily.precipitation_probability_max || [0]));
  const maxRain     = Math.max(...(daily.precipitation_sum || [0]));
  const maxTemp     = Math.max(...(daily.temperature_2m_max || [0]));
  const minTemp     = Math.min(...(daily.temperature_2m_min || [Infinity]));
  const maxWind     = Math.max(...(daily.wind_speed_10m_max || [0]));
  const uvIndex     = current.uv_index || 0;
  const humidity    = current.relative_humidity_2m || 0;

  // Rain advisories
  if (maxRainProb >= 70) {
    tips.push({ type: 'warning', icon: '🌧️', title: 'Postpone Pesticide Application', body: `Rain probability is ${maxRainProb}% in the next 3 days. Avoid spraying pesticides as rain will wash them away and cause runoff.` });
    tips.push({ type: 'info',    icon: '💧', title: 'Irrigation Not Required',       body: 'Expected rainfall in the coming days means you can hold off on irrigation. Monitor soil moisture after rain.' });
  } else if (maxRainProb >= 40) {
    tips.push({ type: 'info',    icon: '🌦️', title: 'Light Rain Possible',           body: `${maxRainProb}% chance of rain in 3 days. Consider light irrigation now and postpone fertilizer application until after rain.` });
  } else {
    tips.push({ type: 'info',    icon: '🚿', title: 'Irrigation Recommended',        body: 'Low rainfall expected. Ensure adequate irrigation, especially for water-intensive crops like paddy and sugarcane.' });
  }

  // Heavy rain / flood risk
  if (maxRain > 50) {
    tips.push({ type: 'danger', icon: '⚠️', title: 'Heavy Rainfall Alert',          body: `Over ${maxRain.toFixed(0)}mm of rain expected. Ensure proper field drainage to prevent waterlogging and root rot.` });
  }

  // Temperature advisories
  if (maxTemp >= 42) {
    tips.push({ type: 'danger', icon: '🌡️', title: 'Heatwave Risk',                  body: `Temperatures may reach ${maxTemp}°C. Irrigate early morning or evening, provide shade to vulnerable crops, and avoid field work during peak heat (11am–3pm).` });
  } else if (maxTemp >= 35) {
    tips.push({ type: 'warning', icon: '☀️', title: 'High Temperature Advisory',     body: `Max temperature of ${maxTemp}°C expected. Increase irrigation frequency. Mulching will help retain soil moisture.` });
  }

  if (minTemp <= 5) {
    tips.push({ type: 'danger', icon: '🥶', title: 'Cold Wave Warning',              body: `Minimum temperature may drop to ${minTemp}°C. Protect sensitive crops from frost damage with covers or smoke methods.` });
  } else if (minTemp <= 12) {
    tips.push({ type: 'warning', icon: '❄️', title: 'Cool Night Advisory',           body: `Nights will be cool (~${minTemp}°C). Delay transplanting of temperature-sensitive seedlings until temperatures rise.` });
  }

  // Wind advisories
  if (maxWind >= 50) {
    tips.push({ type: 'danger', icon: '💨', title: 'Strong Wind Warning',            body: `Wind speeds up to ${maxWind.toFixed(0)} km/h expected. Provide support stakes for tall crops (corn, banana). Postpone any spraying activity.` });
  } else if (maxWind >= 30) {
    tips.push({ type: 'warning', icon: '🌬️', title: 'Moderate Wind Alert',           body: `Winds of ${maxWind.toFixed(0)} km/h expected. Delay aerial spraying and check crop supports.` });
  }

  // UV Index
  if (uvIndex >= 8) {
    tips.push({ type: 'info',   icon: '🕶️', title: 'High UV – Protect Yourself',    body: `UV index is ${uvIndex}. Avoid working in the field between 11am–3pm. Wear protective clothing and stay hydrated.` });
  }

  // Humidity
  if (humidity >= 80) {
    tips.push({ type: 'warning', icon: '🍄', title: 'High Humidity – Disease Risk',  body: `Humidity at ${humidity}%. High risk of fungal diseases (blight, mildew). Monitor crops closely and consider preventive fungicide.` });
  }

  return { tips, generatedAt: new Date().toISOString() };
}
