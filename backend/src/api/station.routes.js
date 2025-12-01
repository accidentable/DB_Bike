// src/api/station.routes.js
// (??) ??/?? ??, ????? ??? ??

const express = require('express');
const router = express.Router();
const stationService = require('../services/station.service');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * GET /api/stations
 * (??) ??? ?? ??
 * ?? ????: ?query=??&lat=37.123&lon=127.123
 */
router.get('/', async (req, res) => {
  try {
    const { query, lat, lon } = req.query;
    const searchParams = {
      query: query,
      lat: parseFloat(lat),
      lon: parseFloat(lon)
    };

    const stations = await stationService.getStations(searchParams);
    res.status(200).json({ success: true, data: stations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stations/favorites/me
 * ? ???? ?? ?? (??? ??)
 */
router.get('/favorites/me', verifyToken, async (req, res) => {
  try {
    const memberId = req.user?.memberId;
    const favorites = await stationService.listFavorites(memberId);
    res.status(200).json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/stations/:stationId/favorite
 * ???? ?? (??? ??)
 */
router.post('/:stationId/favorite', verifyToken, async (req, res) => {
  try {
    const stationId = Number(req.params.stationId);
    const memberId = req.user?.memberId;
    const result = await stationService.addFavorite(memberId, stationId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/stations/:stationId/favorite
 * ???? ?? (??? ??)
 */
router.delete('/:stationId/favorite', verifyToken, async (req, res) => {
  try {
    const stationId = Number(req.params.stationId);
    const memberId = req.user?.memberId;
    const result = await stationService.removeFavorite(memberId, stationId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stations/:stationId/bikes
 * (??) ?? ???? ?? ??? ??? ?? ??
 */
router.get('/:stationId/bikes', async (req, res) => { 
  try {
    const stationId = Number(req.params.stationId);
    const bikes = await stationService.getAvailableBikes(stationId);
    res.status(200).json({ success: true, data: bikes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
