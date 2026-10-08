const express = require('express');
const router = express.Router();
const { postLocation } = require('../controllers/locationController');

// Called by the ESP32 device - no auth (device uses a shared busId instead).
// See README "ESP32 API Integration" for production hardening notes
// (e.g. adding a device API key).
router.post('/', postLocation);

module.exports = router;
