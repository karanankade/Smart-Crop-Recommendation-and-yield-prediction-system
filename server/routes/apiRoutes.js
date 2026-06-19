const express = require('express');
const { recommendCrop, predictYield, analyzeSoil, getWeather, irrigationSuggest, marketAnalysis, getDashboardStats } = require('../controllers/apiController');
const { getNotifications, readNotification, readAllNotifications, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Protected general routes
router.post('/recommend', protect, recommendCrop);
router.post('/yield', protect, predictYield);
router.post('/soil', protect, analyzeSoil);
router.post('/irrigation', protect, irrigationSuggest);
router.post('/market', protect, marketAnalysis);
router.get('/weather', protect, getWeather);
router.get('/dashboard/stats', protect, getDashboardStats);

// Protected notification routes
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, readAllNotifications);
router.put('/notifications/:id/read', protect, readNotification);
router.delete('/notifications/:id', protect, deleteNotification);

module.exports = router;
