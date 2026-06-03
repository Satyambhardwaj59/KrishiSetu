const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/weather.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');

// ── Public routes (optionally authenticated for richer data) ──────────────────
router.get('/',        optionalAuth, ctrl.getWeather);        // GET /api/weather?lat=&lon=
router.get('/search',  optionalAuth, ctrl.searchLocation);    // GET /api/weather/search?q=
router.get('/reverse', optionalAuth, ctrl.reverseGeocode);    // GET /api/weather/reverse?lat=&lon=
router.get('/advisory', optionalAuth, ctrl.getCropAdvisory);  // GET /api/weather/advisory?lat=&lon=

// ── Authenticated routes ────────────────────────────────────────────────────
router.use(protect);
router.get('/saved',         ctrl.getSavedLocations);          // GET  /api/weather/saved
router.post('/saved',        ctrl.saveLocation);               // POST /api/weather/saved
router.delete('/saved/:index', ctrl.deleteSavedLocation);      // DEL  /api/weather/saved/:index

module.exports = router;
