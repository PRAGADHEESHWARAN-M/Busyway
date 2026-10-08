const express = require('express');
const router = express.Router();
const { getRoutes, getRouteById } = require('../controllers/routeController');

router.get('/', getRoutes);
router.get('/:id', getRouteById);

module.exports = router;
