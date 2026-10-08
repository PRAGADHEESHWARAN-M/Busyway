const express = require('express');
const router = express.Router();
const { getStops } = require('../controllers/stopController');

router.get('/', getStops);

module.exports = router;
