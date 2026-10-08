const express = require('express');
const router = express.Router();
const { getBuses, getBusById, getBusLocationStatus } = require('../controllers/busController');

router.get('/', getBuses);
router.get('/:id', getBusById);
router.get('/:id/location', getBusLocationStatus);

module.exports = router;
