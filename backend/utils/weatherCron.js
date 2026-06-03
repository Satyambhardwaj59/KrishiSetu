/**
 * weatherCron.js
 * Scheduled weather-alert job that runs every 12 hours.
 * Checks forecasts for all users with weatherAlertsEnabled = true,
 * generates Notification records, and emits them over WebSocket.
 */
const cron         = require('node-cron');
const axios        = require('axios');
const User         = require('../models/User');
const Notification = require('../models/Notification');
const logger       = require('./logger');

const WEATHER_URL = 'https://api.open-meteo.com/v1';

/**
 * Determine whether a forecast triggers a severe alert,
 * returning alert objects (title, body) or an empty array.
 */
function buildAlerts(daily) {
  const alerts = [];

  const maxRainProb = Math.max(...(daily.precipitation_probability_max || [0]));
  const maxRain     = Math.max(...(daily.precipitation_sum || [0]));
  const maxTemp     = Math.max(...(daily.temperature_2m_max || [0]));
  const minTemp     = Math.min(...(daily.temperature_2m_min || [Infinity]));
  const maxWind     = Math.max(...(daily.wind_speed_10m_max || [0]));
  const codes       = daily.weather_code || [];

  const hasThunderstorm = codes.some(c => c >= 95);
  const hasHeavyRain    = codes.some(c => [65, 82].includes(c));

  if (hasThunderstorm)
    alerts.push({ title: '⛈️ Thunderstorm Warning', body: 'A thunderstorm has been forecast for your area in the next 72 hours. Secure loose equipment and stay indoors during the storm.' });

  if (hasHeavyRain || maxRain > 50)
    alerts.push({ title: '🌧️ Heavy Rainfall Alert', body: `Heavy rainfall (${maxRain.toFixed(0)}mm) is expected. Consider harvesting ready crops and ensure proper field drainage to prevent waterlogging.` });

  if (maxTemp >= 42)
    alerts.push({ title: '🌡️ Heatwave Alert', body: `Temperatures may exceed ${maxTemp.toFixed(0)}°C. Protect crops from heat stress; irrigate during cooler hours.` });

  if (minTemp <= 5)
    alerts.push({ title: '🥶 Cold Wave Warning', body: `Temperatures may drop to ${minTemp.toFixed(0)}°C. Take measures to protect sensitive crops from frost damage.` });

  if (maxWind >= 50)
    alerts.push({ title: '💨 Strong Wind Warning', body: `Wind speeds up to ${maxWind.toFixed(0)} km/h expected. Support tall crops and postpone spraying activities.` });

  if (maxRainProb >= 80)
    alerts.push({ title: '☔ High Rain Probability', body: `There is a ${maxRainProb}% chance of rain. Avoid applying pesticides or fertilizers until after the rain.` });

  return alerts;
}

/**
 * Core job: fetch forecast for each unique user location and emit alerts.
 * @param {import('socket.io').Server} io
 */
const runWeatherAlertJob = async (io) => {
  try {
    logger.info('[weatherCron] Running weather alert check...');

    // Only query users who have a saved GPS location and have alerts enabled
    const users = await User.find({
      weatherAlertsEnabled : true,
      isActive             : true,
      'location.coordinates.0': { $ne: 0 },
    }).select('_id name location').lean();

    if (!users.length) {
      logger.info('[weatherCron] No users with location data found. Skipping.');
      return;
    }

    // Deduplicate by ~0.5° grid to avoid redundant API calls
    const locationMap = new Map();
    for (const user of users) {
      const [lon, lat] = user.location.coordinates;
      const gridKey = `${(lat / 0.5).toFixed(0)}_${(lon / 0.5).toFixed(0)}`;
      if (!locationMap.has(gridKey)) locationMap.set(gridKey, { lat, lon, users: [] });
      locationMap.get(gridKey).users.push(user._id);
    }

    const emitNotification = io
      ? (recipientId, notif) => {
          io.to(String(recipientId)).emit('notification', notif);
          io.to(`notif:${recipientId}`).emit('notification', notif);
        }
      : () => {};

    for (const [, { lat, lon, users: recipientIds }] of locationMap) {
      try {
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
            forecast_days: 3,
          },
        });

        const alerts = buildAlerts(data.daily || {});
        if (!alerts.length) continue;

        // Create Notification docs in bulk
        for (const recipientId of recipientIds) {
          for (const alert of alerts) {
            const notif = await Notification.create({
              recipient: recipientId,
              type     : 'weather_alert',
              title    : alert.title,
              body     : alert.body,
              data     : { lat, lon },
            });
            emitNotification(recipientId, notif);
          }
        }

        logger.info(`[weatherCron] Sent ${alerts.length} alert(s) to ${recipientIds.length} user(s)`);
      } catch (err) {
        logger.error(`[weatherCron] Forecast fetch failed for (${lat},${lon}): ${err.message}`);
      }
    }

    logger.info('[weatherCron] Weather alert check complete.');
  } catch (err) {
    logger.error(`[weatherCron] Job error: ${err.message}`);
  }
};

/**
 * Initialize the cron scheduler.
 * @param {import('socket.io').Server} io
 */
const initWeatherCron = (io) => {
  // Run every 12 hours: at 06:00 and 18:00
  cron.schedule('0 6,18 * * *', () => runWeatherAlertJob(io), { timezone: 'Asia/Kolkata' });
  logger.info('[weatherCron] Weather alert scheduler initialized (runs at 06:00 & 18:00 IST)');
};

module.exports = { initWeatherCron, runWeatherAlertJob };
