const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const admin = require('../controllers/adminController');
const demo = require('../controllers/demoController');

// Every route below requires a valid admin JWT.
router.use(protect, authorize('admin'));

router.get('/dashboard', admin.getDashboardStats);

router.post('/buses', admin.createBus);
router.put('/buses/:id', admin.updateBus);
router.delete('/buses/:id', admin.deleteBus);

router.post('/routes', admin.createRoute);
router.put('/routes/:id', admin.updateRoute);
router.delete('/routes/:id', admin.deleteRoute);

router.post('/stops', admin.createStop);
router.put('/stops/reorder', admin.reorderStops);
router.put('/stops/:id', admin.updateStop);
router.delete('/stops/:id', admin.deleteStop);

router.get('/students', admin.getStudents);
router.delete('/students/:id', admin.deleteStudent);

router.post('/demo/:busId/start', demo.startDemo);
router.post('/demo/:busId/pause', demo.pauseDemo);
router.post('/demo/:busId/resume', demo.resumeDemo);
router.post('/demo/:busId/reset', demo.resetDemo);
router.post('/demo/:busId/next-stop', demo.nextStop);

module.exports = router;
